{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      forAllSystems = nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              biome
              lychee
              nodejs-slim
              pagefind
              pnpm
              prettier
              typescript
            ];
            shellHook = ''
              set -a; source .env; set +a
            '';
          };
        }
      );
    };
}
