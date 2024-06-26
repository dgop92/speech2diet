# Fitvoice Insfrastruture As Code

## Useful commands

Network Stack in dev environment

```bash
cdk synth fitvoice-app-network-dev-stack -c config=dev
cdk diff fitvoice-app-network-dev-stack -c config=dev
cdk deploy fitvoice-app-network-dev-stack -c config=dev
```

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

ECR Repository Stack in dev environment

```bash
cdk synth fitvoice-app-ecr-repository-dev-stack -c config=dev
cdk diff fitvoice-app-ecr-repository-dev-stack -c config=dev
cdk deploy fitvoice-app-ecr-repository-dev-stack -c config=dev
```

S2D-API Stack in dev environment

```bash
cdk synth fitvoice-app-s2d-api-dev-stack -c config=dev
cdk diff fitvoice-app-s2d-api-dev-stack -c config=dev
cdk deploy fitvoice-app-s2d-api-dev-stack -c config=dev
```

S2N-DEMO Stack in dev environment

```bash
cdk synth fitvoice-app-s2n-demo-dev-stack -c config=dev
cdk diff fitvoice-app-s2n-demo-dev-stack -c config=dev
cdk deploy fitvoice-app-s2n-demo-dev-stack -c config=dev
```
