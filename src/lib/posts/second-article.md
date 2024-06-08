---
title: 'Second Article'
date: '2024-05-20T21:47:00Z'
updated: ''
categories:
  - default
  - test
coverImage: true
coverAlt: "A photograph of various overlaid neon signs"
excerpt: This is a placeholder article 2
---

## Subtitle

Hello world!

```rust
fn main() {
    // Variables can be type annotated.
    let logical: bool = true;

    let a_float: f64 = 1.0;  // Regular annotation
    let an_integer   = 5i32; // Suffix annotation

    // Or a default will be used.
    let default_float   = 3.0; // `f64`
    let default_integer = 7;   // `i32`

    // A type can also be inferred from context.
    let mut inferred_type = 12; // Type i64 is inferred from another line.
    inferred_type = 4294967296i64;

    // A mutable variable's value can be changed.
    let mut mutable = 12; // Mutable `i32`
    mutable = 21;

    // Error! The type of a variable can't be changed.
    mutable = true;

    // Variables can be overwritten with shadowing.
    let mutable = true;
}
```

 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed arcu neque, porttitor id commodo nec, faucibus vel odio. Nulla malesuada hendrerit dolor vitae vulputate. Sed in ipsum sit amet nulla pellentesque rhoncus viverra nec nisl. Etiam ut libero dapibus, venenatis nisl non, vestibulum erat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut neque id lorem venenatis ornare eget quis neque. Sed porttitor, nibh a tempor imperdiet, nisi sapien lacinia dolor, ut tempor libero mauris vitae quam. Nullam consequat volutpat libero eu vehicula. Nulla facilisi.

Quisque at bibendum risus. Sed volutpat euismod semper. Ut sit amet pharetra nisl. Sed condimentum tristique ipsum sed interdum. Maecenas gravida molestie neque at condimentum. Donec vitae orci vehicula risus aliquet porttitor. Sed vitae dictum nunc. Fusce mollis sem molestie turpis feugiat, eu accumsan nulla elementum. Etiam eget erat lacinia, venenatis est eu, tincidunt nulla. Quisque egestas fermentum nibh nec maximus. Aliquam tincidunt dolor quis scelerisque mollis. 
