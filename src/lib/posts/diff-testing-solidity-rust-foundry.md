---
title: Diff-Testing Solidity with Rust and Foundry
date: 2024-06-14T12:21:00Z
# updated:
categories:
  - rust
  - solidity
  - foundry
  - testing
coverImage: false
# coverAlt: ""
excerpt: >
  Differential testing allows to compare implementations and is especially useful in Solidity, where optimizations are
  frequently made by replacing code with low-level YUL instructions. By leverage the fast startup times and low
  footprint of Rust binaries via FFI, Foundry allows to efficiently integrate diff testing in Solidity projects.
---

<script lang="ts">
  import stars from './diff-testing-solidity-rust-foundry/star-history-2024614.png?enhanced&imgSizes=true'
  import Image from '$lib/components/Image.svelte'
  import Console from '$lib/components/Console.svelte'
</script>

## Contents

## Introduction

Differential testing (or diff-testing for short) is a fuzzing technique which aims at detecting bugs by comparing two
different implementations of the same algorithm and checking for inconsistencies in their output or execution.

In the context of [Solidity](https://soliditylang.org/) smart-contract development, where optimizations in the form
of [gas usage](https://docs.soliditylang.org/en/v0.8.26/introduction-to-smart-contracts.html#gas) reduction lead to
cheaper blockchain transactions, diff-testing is particularly interesting. In order to optimize execution, blockchain
programmers will often resort to implementing their algorithms in the low-level
[YUL](https://docs.soliditylang.org/en/v0.8.26/yul.html) language, with instructions closer to the final bytecode that
gets interpreted by the EVM. Collections of libraries and tools such as
[Solady](https://github.com/Vectorized/solady) are even being developed to make maximum usage of YUL in common
smart-contract use cases.

YUL, while allowing for great control over the stack and memory usage, is harder to write and comprehend, and also
skips some of the safety checks that Solidity natively adds behind the scenes (like overflow checks in math operations).
It comes to no surprise that diff-testing can greatly improve the developers' confidence in their low-level and highly
optimized implementations.

For such programs, diff-testing against a naive and trusted Solidity implementation is common practice. However, when
it comes to algorithms written in Solidity, there isn't always a way to efficiently compare the implementation against
another. Sure, one could implement another version of the algorithm in Solidity to compare against, but there isn't
always one and naive/alternative approaches are not always easy to implement in the constrained EVM runtime.

If only we could compare algorithms in diff-testing between different languages...

## Enter FFI

The [Foundry](https://github.com/foundry-rs/foundry/) development toolkit has transformed the developer experience
of blockchain programmers since its inception in 2021, as seen by the wide adoption it got over the last couple of
years. The ability to use the Solidity language across the full development cycle, from testing to deploying contracts
is surely to thank for that.

<Image
  src={stars}
  maxWidth={500}
  alt="A chart of the evolution of GitHub stars for the Foundry and Hardhat projects. The Foundry line shows a rapid
  increase in stars count while the Hardhat line shows that its slope is decreasing since 2023. The Foundry project
  overtook Hardhat in terms of stars around the beginning of 2023."
  caption="Although arguably not the best metric of popularity, the number of stars Foundry has on GitHub, compared to
  the previously popular toolkit Hardhat, demonstrates the shifting preference of the Solidity ecosystem."
/>

One extremely powerful feature of the Foundry test utilities is its ability to call external binaries through a
Foreign Function Interface with the `vm.ffi` [cheatcode](https://book.getfoundry.sh/cheatcodes/ffi).

```solidity
function testFuzz_echo(uint256 rand) public {
    string[] memory inputs = new string[](3);
    inputs[0] = "echo";
    inputs[1] = "-n";
    // hex string representation of the random input in big endian
    inputs[2] = vm.toString(bytes32(rand));

    // command output (hexadecimal string) is parsed into bytes
    bytes memory res = vm.ffi(inputs);
    uint256 val = abi.decode(res, (uint256));
    assertEq(val, rand, "comparing input and output");
}
```

This opens up so many possibilities, from interaction with off-chain APIs to retrieve test data, to the topic of today:
diff-testing against an implementation in another programming language.

## A Wild "Rust" Appears

It will be obvious to those who know me personally that my language of choice for implementing FFI test utilities
(well, really, for implementing anything!) is Rust.

In the context of today however, Rust is particularly interesting because, it being a compiled language with a focus on
correctness and performance, the **startup times and memory footprint** are relatively small, and the expansive crate
ecosystem makes it a breeze to find good quality alternative implementations for many things.

Since diff-testing often relies of fuzzing the inputs to a particular function (_i.e._ generating random values), the
test will be run many thousands of times. Each time, the Foundry suite needs to call our test utility once, to retrieve
the output of the reference implementation. If the executable were to have a slow startup time, this would dramatically
increase the time spent running our test.

### Testing Overhead

The above example calling the `echo` command takes **192ms** on my machine for 256 fuzzing runs. Compared to this,
the same test which doesn't call `echo` (but performs otherwise all the same operations of building the array in memory
and the assert) takes **9ms**. The FFI test is a noticeably slower of course, which is why we have to make our
executable as fast as possible.

## Project Setup

Let's setup a project to demonstrate some basic uses of the techniques described above.

First, we create a new Foundry project and initiate a Rust project inside:

<Console entries={[
"forge init diff-testing",
"cd diff-testing",
"cargo new utils",
]} />

Since we want to be able to invoke `cargo` commands directly from the root of the `diff-testing` project and have the
built binary reside inside the `./target/release` folder, we will add a `Cargo.toml` file at the root:

```toml
[workspace]
resolver = "2"
members = ["utils"]

[profile.release]
strip = true
lto = true
panic = "abort"
```

The release profile has been slightly tweaked to produce a smaller binary, and should already be optimized for speed.

Now, running the following inside our project should compile and run the Rust binary in release mode:


<Console entries={[
"cargo run -qr",
{ text: "Hello, world!", prefix: "", cl: "text-info" }
]} />

*[FFI]: Foreign Function Interface
*[EVM]: Ethereum Virtual Machine
