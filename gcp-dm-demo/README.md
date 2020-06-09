#GCP Configuration vs. Template

1. demo2.yaml - declares explicitly every resource. It's redundant and long but ok if you want to just quickly create something small with advanced options (however it's usually easier to run gcloud)
1. demo2.jinja - template deploying the same resources but using variables and a loop. Needs to be provided with a property: gcloud deployment-manager deployments create deploymentname --template demo2.jinja --properties prefix:myprefix
1. demo2-config.yaml - a proper config calling a template and providing values for the properties
