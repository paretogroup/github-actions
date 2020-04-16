# Label Rebase

Realizando rebase com a branch destino sempre que selecionada a label `rebase`

_Baseado na action [https://github.com/cirrus-actions/rebase](https://github.com/cirrus-actions/rebase)_

## Utilizando nos projetos

Crie um arquivo `.github/workflows/rebase.yml` e adicione as configurações.

```yaml
on: 
  pull_request:
    types: [labeled]

name: Label Rebase

jobs:
  rebase:
    name: Rebase
    if: contains(github.event.pull_request.labels.*.name, 'rebase')
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
      with:
        fetch-depth: 0
    - name: Automatic Rebase
      uses: paretogroup/github-actions/label-rebase@rebase
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  # https://github.community/t5/GitHub-Actions/Workflow-is-failing-if-no-job-can-be-ran-due-to-condition/m-p/38186#M3250
  always_job:
    name: Always run job
    runs-on: ubuntu-latest
    steps:
      - name: Always run
        run: echo "This job is used to prevent the workflow to fail when all other jobs are skipped." 
```