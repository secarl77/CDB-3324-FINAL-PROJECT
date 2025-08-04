output "vpc_id" {
  description = "ID VPC created"
  value       = aws_vpc.CDB_3375_vpc.id
}

output "devops-tool-ip" {
  description = "Public Ip for devops-tool-instance "
  value       = aws_instance.CDB_3375_devops-tools-instance
}

output "jenkins-ip" {
  description = "Public Ip for Jenkins-instance"
  value       = aws_instance.CDB_3375_jenkins-instance
}


output "webapp-ip" {
  description = "Public Ip for webapp-instance"
  value       = aws_instance.CDB_3375_webapp-instance
}
