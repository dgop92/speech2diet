# Fitvoice Insfrastruture As Code

## Useful commands

Storage Stack in dev environment

```bash
cdk synth fitvoice-app-storage-dev-stack -c config=dev
cdk diff fitvoice-app-storage-dev-stack -c config=dev
cdk deploy fitvoice-app-storage-dev-stack -c config=dev
```

Lambda Stack in dev environment

```bash
cdk synth fitvoice-app-lambda-dev-stack -c config=dev
cdk diff fitvoice-app-lambda-dev-stack -c config=dev
cdk deploy fitvoice-app-lambda-dev-stack -c config=dev
```
