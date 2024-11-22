---
title: Rust for AWS Lambda, the Docker Way
date: 2024-11-22T11:30:00Z
# updated:
categories:
  - rust
  - docker
  - aws lambda
  - webdev
  - tutorial
coverImage: true
coverCredits: Photo by Erwan Hesry on Unsplash
coverAlt: A view of four shipping containers which show some signs of rust.
excerpt: >
  In this short article, we go over a setup to distribute AWS Lambda endpoints written in the Rust programming language
  through Docker images instead of a zipped binary. This technique leverages the power of Cargo Lambda and multi-stage
  Docker builds.
---

<script lang="ts">
  import ChatNote from '$lib/components/ChatNote.svelte'
  import Console from '$lib/components/Console.svelte'
</script>

## Contents

## Introduction

Rust is a great language to consider when writing services for [AWS Lambda](https://aws.amazon.com/lambda/), because of
its extremely low start-up time, CPU usage and memory footprint.
These are all important metrics to consider in serverless infrastructure and they translate to direct cost savings and
better performance when minimized.

The [recommended](https://docs.aws.amazon.com/lambda/latest/dg/rust-package.html) and most straightforward way to deploy
Rust programs to AWS Lambda is to upload a zipped binary, either through the
[AWS CLI](https://docs.aws.amazon.com/lambda/latest/dg/rust-package.html#rust-deploy-cargo) or with the amazing
[Cargo Lambda](https://www.cargo-lambda.info/commands/deploy.html). While the latter makes the process of testing,
compiling and deploying Rust Lambdas very easy, there is sometimes the need to distribute a Docker image instead of
the raw binary. For instance, using container images allows to leverage the ECR container registry in AWS for
versioning and distribution.

In this short article, we'll see how we can leverage Cargo Lambda and Docker to create an image suitable for use with
Lambda.

## The Rust Code

Below is the example Lambda that we will use to test our deployment. It's a simple "hello world" taken from the
default `cargo lambda new` template, which takes in a `name` query string parameter and outputs a very simple greeting
message.

```rust
use lambda_http::{run, service_fn, tracing, Body, Error, Request, RequestExt, Response};

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let who = event
        .query_string_parameters_ref()
        .and_then(|params| params.first("name"))
        .unwrap_or("world");
    let message = format!("Hello {who}, this is an AWS Lambda HTTP request");

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(message.into())
        .map_err(Box::new)?;
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
```

## Cargo Lambda

After [installing Cargo Lambda](https://www.cargo-lambda.info/guide/installation.html), we have access to a cargo
plugin invoked with the `cargo lambda` command which makes developing for AWS Lambda in Rust a breeze!

The `cargo lambda new` creates a template with all the necessary dependencies and boilerplate. `cargo lambda watch`
compiles and runs the lambda locally whenever a source file is changed. `cargo lambda invoke` allows to send test
requests to this locally-running lambda without worrying about the AWS event object format, API Gateway, etc.

`cargo lambda build --release` is the command that we will need, as it includes a good default build profile for
Lambda, and allows to cross-compile for different processor architectures.

<ChatNote>
Interestingly, Cargo Lambda uses the <a href="https://www.cargo-lambda.info/guide/cross-compiling.html" ref="nofollow">
Zig toolchain to enable cross-compilation</a>. How cool! Note that the use of
<a href="https://github.com/cross-rs/cross" ref="nofollow">cross</a> is also supported.
</ChatNote>

## The Dockerfile

The Dockerfile below is what took me some time to research and find information about. In the end, some trial and error
paired with the use of the GitHub search bar allowed me to find the most straightforward way to get to a working
Docker image.

```Dockerfile
# The build image with Cargo Lambda pre-installed
FROM ghcr.io/cargo-lambda/cargo-lambda:latest AS build

WORKDIR /build
# Copy the source files into the container
COPY . .
# Thanks to Cargo Lambda, compilation is super easy
RUN cargo lambda build --release

# The runtime image is an OS-only image without an included runtime
# Our binary contains the required runtime already
FROM public.ecr.aws/lambda/provided:al2023 AS runtime

# Retrieve the binary that we built in the stage above
COPY --from=build /build/target/lambda/hello_world/bootstrap ${LAMBDA_RUNTIME_DIR}/bootstrap

# Not used with custom runtime, but kept for info
CMD ["app.handler"]
```

Simple, isn't it? Well, it took me a while to understand which base image to use, where to put the resulting binary
inside the image and what it should be named, but this proved to be the working solution after some good old trial and
error.

You'll note that we included the crate name in the path for the last `COPY` instruction. You'll also notice no mention
of cross-compilation here. So, while this file works for a one-off, it can be greatly improved and generalized if we
use [build args](https://docs.docker.com/build/building/variables/).

## Configurable Dockerfile

Without further ado, here's the version which allows cross-compilation and parametrization through some variables.

```Dockerfile
FROM --platform=$BUILDPLATFORM ghcr.io/cargo-lambda/cargo-lambda:latest AS build
ARG package
ARG TARGETPLATFORM

WORKDIR /build
COPY . .
RUN case ${TARGETPLATFORM} in \
  "linux/amd64") RUST_ARCH=x86_64-unknown-linux-gnu ;; \
  "linux/arm64") RUST_ARCH=aarch64-unknown-linux-gnu ;; \
  *) exit 1 ;; \
  esac \
  && cargo lambda build --release --target ${RUST_ARCH} --bin $package

FROM public.ecr.aws/lambda/provided:al2023 AS runtime
ARG package

COPY --from=build /build/target/lambda/$package/bootstrap ${LAMBDA_RUNTIME_DIR}/bootstrap

CMD ["app.handler"]
```

In the file above, the target platform and name of the package are build-time parameters that allow to create different
images from a single Dockerfile. Only `linux/amd64` and `linux/arm64` are
[supported by AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html).

Here's how this file would be used to build an ARM image for our `hello_world` service:

<Console entries={[
"docker build --platform linux/arm64 --build-arg package=hello_world -t hello_world:latest ."
]} />

Note that this Dockerfile would work within a Cargo workspace thanks to the `--bin $package` argument, so you could use
a single Dockerfile to compile every service in your monorepo!

## Bonus Tips

In this final section, we'll see how we can test our Docker image locally. Since we cannot use `cargo lambda invoke`,
we need to formulate our request in a format that is comprehensible to the AWS Lambda runtime.

To spin up our container, we use the following command:

<Console entries={[
"docker run --rm -p 8080:8080 hello_world:latest"
]} />

The request needs to be sent with the `POST` method and a JSON body matching the
[Payload 2.0 format](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html).
It wraps our `GET` HTTP request with some metadata, and a minimal payload for our example would be:

```json
{
  "version": "2.0",
  "rawQueryString": "name=beeb",
  "requestContext": {
    "http": {
      "method": "GET"
    },
    "timeEpoch": 0
  }
}
```

The URL to target, considering we exposed the `8080` port of the container to the same port in our `localhost`, is:

`http://localhost:8080/2015-03-31/functions/function/invocations`

It took me a while to find this information because I didn't really know what I was looking for. Turns out the
["Invoke" docs describes this URL](https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html).

If we send this request to the container, we get a response from our function 🎉 (albeit wrapped in the API Gateway
response format).

<Console entries={[
"curl -X POST --data '{\"version\":\"2.0\",\"rawQueryString\":\"name=beeb\",\"requestContext\":{\"http\":{\"method\":\"GET\"},\"timeEpoch\":0}}' http://localhost:8080/2015-03-31/functions/function/invocations",
{ text: "{\"statusCode\":200,\"headers\":{\"content-type\":\"text/html\"},\"multiValueHeaders\":{},\"body\":\"Hello beeb, this is an AWS Lambda HTTP request\",\"isBase64Encoded\":false,\"cookies\":[]}", prefix: "", cl: "text-info" },
]} />

## Final Words

Just like that, we have cross-compiled our Lambda for ARM and have a container image ready to deploy.

I hope you found something useful in this article. Talk soon!

*[CLI]: Command Line Interface
*[HTTP]: Hypertext Transfer Protocol
*[URL]: Uniform Resource Locator
*[API]: Application Programming Interface

