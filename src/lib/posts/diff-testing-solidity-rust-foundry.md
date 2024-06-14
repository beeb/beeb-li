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
  caption="The popularity of Foundry can be seen by comparing the number of stars it has on GitHub, compared to the
  previously popular toolkit Hardhat."
/>

One extremely powerful feature of the Foundry test utilities is its ability to call external binaries through a
Foreign Function Interface with the `vm.ffi` [cheatcode](https://book.getfoundry.sh/cheatcodes/ffi).

```solidity
// inside a foundry test
string[] memory inputs = new string[](3);
inputs[0] = "echo";
inputs[1] = "-n";
inputs[2] = "0x42";

bytes memory res = vm.ffi(inputs);
assertEq(res, hex"42");
```

This opens up so many possibilities, from interaction with off-chain APIs to retrieve test data, to the topic of today:
diff-testing against an implementation in another programming language.

## A Wild "Rust" Appears

It will be obvious to those who know me personally that my language of choice for implementing FFI test utilities
(well, really, for implementing anything!) is Rust.

In the context of today however, Rust is particularly interesting because, it being a compiled language with a focus on
correctness and performance, the **startup times and memory footprint** are relatively small, and the expansive crate
ecosystem makes it a breeze to find good quality alternative implementations for many things.

Since diff-testing often relies of fuzzing the inputs to a particular function, the test will be run many thousands of
times. Each time, the Foundry suite needs to call our test utility once, to retrieve the output of the reference
implementation. If the executable were to have a slow startup time, this would dramatically reduce the time spent
running our test.

*[FFI]: Foreign Function Interface
*[EVM]: Ethereum Virtual Machine
