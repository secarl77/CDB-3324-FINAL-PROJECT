import jenkins.model.*
import hudson.PluginWrapper

def instance = Jenkins.getInstance()
def pluginManager = instance.getPluginManager()
def updateCenter = instance.getUpdateCenter()

def plugins = [
  "git",
  "workflow-aggregator",   // Soporte para pipelines
  "ansible",
  "matrix-auth",
  "credentials",
  "ssh-slaves",
  "blueocean",
  "docker-plugin",
  "pipeline-stage-view",
  "workflow-job",
  "pipeline-model-definition"
]

def installed = false

plugins.each { pluginName ->
  if (!pluginManager.getPlugin(pluginName)) {
    def plugin = updateCenter.getPlugin(pluginName)
    if (plugin) {
      println "Instalando plugin: ${pluginName}"
      plugin.deploy()
      installed = true
    } else {
      println "No se encontró el plugin: ${pluginName}"
    }
  } else {
    println "Plugin ya instalado: ${pluginName}"
  }
}

if (installed) {
  println "--> Reiniciando Jenkins para activar plugins"
  instance.save()
  instance.restart()
}

