# Proxy and Load Balancer

This repository generates a NGINX-based docker image configured to proxy/load balance the Neuron Browser public instance
services.  Changes to the number of available instances or names of any services should be reflected in `nginx.conf`.  The
image also pulls in the NGINX Amplify Agent for downtime alerts.

### Build
The [Taskfile](https://taskfile.dev/) is a convenience wrapper around docker build/push for the same image with major/minor/revision/latest tags.
