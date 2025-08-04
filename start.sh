#!/bin/bash

echo "🔧 Ejecutando Terraform..."
terraform apply -auto-approve

if [ $? -eq 0 ]; then
    echo "✅ Terraform successful completed."
    echo "🚀 Executing Ansible Playbook..."
    ansible-playbook -i inventory.ini playbook-devops.yml
else
    echo "❌ Terraform fail. We don't execute Ansible."
fi

