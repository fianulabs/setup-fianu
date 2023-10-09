# :gear: `setup-fianu`

## About
This action can be run on `ubuntu-latest`, `windows-latest`, and `macos-latest` GitHub Actions runners, and will install and expose a specified version of the `fianu` CLI on the runner environment.

## Usage

Setup the `gh` CLI:

```yaml
steps:
- uses: fianulabs/setup-fianu@main
```

A specific version of the `fianu` CLI can be installed:

```yaml
steps:
- uses: fianulabs/setup-fianu@main
  with:
    version: ${{ secrets.FIANU_VERSION }}
```

## Inputs
The actions supports the following inputs:

- `version`: The version of `fianu` to install, defaulting to `latest`

## License
[MIT](LICENSE).
