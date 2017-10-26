# NodeConfAR2017 Natural Language Processing Workshop

## Preparación

### 1. Cofigurar entorno

Antes de clonar el repo, tener en cuenta que queremos lograr la siguiente estructura de directorios... por eso antes ue nada hay que crear la carpeta de trabajo a la que vamos a apuntar luego con una variable de entorno `$WORKSHOPPATH`.

```txt
nlp-workshop/
	├── nodeconfar2017-nlp-workshop/                      <-- este repo 🌝
	├── CoreNLP/                                          <-- https://github.com/stanfordnlp/CoreNLP
	└── stanford-spanish-corenlp-2017-06-09-models.jar    <-- https://nlp.stanford.edu/software/stanford-spanish-corenlp-2017-06-09-models.jar
```

#### 1.1. Variables de entorno para facilitar todo

```bash
# Incluí lo que sigue en tu .bashrc (Linux) o .bash_profile (OSX)
# El path tiene que ser absoluto sino más adelante se rompe todo (modificar el path $CORENLPPATH a gusto)

export WORKSHOPPATH="$HOME/nlp-workshop"  ## <-- modificar a gusto, solo ésta variable
export PROTOTYPEPATH="$WORKSHOPPATH/nodeconfar2017-nlp-workshop"
export PROTOTYPEMODELPATH="$PROTOTYPEPATH/src/model"
export CORENLPPATH="$WORKSHOPPATH/CoreNLP"
export CLASSPATH="*:$CORENLPPATH/*" # <-- esta variable es la que JRE usa para buscar los '.jar' ó CoreNLP los modelos, además del "current path"

# ...darle `source` al bash profile para cargar dichas variables de entorno
```

Debería quedar algo así...

```txt
.                                                       <-- $WORKSHOPPATH
├── nodeconfar2017-nlp-workshop                         <-- $PROTOTYPEPATH
│   ├── README.md
│   ├── corenlp
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   └── src
├── CoreNLP                                             <-- $CORENLPPATH
│   ├── CONTRIBUTING.md
│   ├── JavaNLP-core.eml
│   ├── JavaNLP-core.iml
│   ├── LICENSE.txt
│   ├── README.md
│   ├── build.gradle
│   ├── build.xml
│   ├── classes
│   ├── commonbuildjsp.xml
│   ├── data
│   ├── doc
│   ├── gradle
│   ├── gradlew
│   ├── gradlew.bat
│   ├── itest
│   ├── javanlp-core.jar                                <-- este jar es el resultado de compilar con `ant jar`
│   ├── lib
│   ├── liblocal
│   ├── libsrc
│   ├── licenses
│   ├── module_core.xml
│   ├── pom.xml
│   ├── scripts
│   ├── src
│   └── test
└── stanford-spanish-corenlp-2017-06-09-models.jar      <-- modelo Spanish por defecto
```

#### 1.2. Cloná este repo (el prototipo)

```bash
git clone https://github.com/gerardobort/nodeconfar2017-nlp-workshop $PROTOTYPEPATH
```

#### 1.3. Descargá CoreNLP

```bash
# Clonate el repo original de CoreNLP
git clone https://github.com/stanfordnlp/CoreNLP.git $CORENLPPATH

# descargate el modelo de Español y guardalo dentro de la carpeta del workshop
cd $WORKSHOPPATH && curl -O https://nlp.stanford.edu/software/stanford-spanish-corenlp-2017-06-09-models.jar
```

#### 1.4. Descargá JDK

Antes de compilar debemos asegurarnos tener correctamente instalado Ant:

##### 1.4.1. Linux (Debian)

```bash
sudo apt-get install ant
```

##### 1.4.2. Mac

```bash
brew install ant coreutils
# en caso de no funcionar.... `brew cask install ant coreutils`
```

#### 1.5. Compilá CoreNLP

```bash
cd $CORENLPPATH && ant jar
```

##### 1.5.1 En caso de no poder compilar CoreNLP...

Cualquiera fuese el motivo de no poder compilar CoreNLP -a modo de salvavidas-, dentro de este repositorio podés encontrar el `.jar` precompilado.  Para que funcione todo, solo tenés que copiarlo a la raíz del repo de CoreNLP.

```bash
cp $PROTOTYPEPATH/corenlp/justincase/java-corenlp.jar $CORENLPPATH/
```

## 2. Corré CoreNLP

```bash
# Al ejecutarlo desde la carpeta raíz del workshop, levanta el modelo spanish.... más adelante lo ejecutaremos desde nuestra carpeta src/model, para usar nuestros propios modelos.
cd $WORKSHOPPATH
java -cp "*:CoreNLP/*" -Xmx4g edu.stanford.nlp.pipeline.StanfordCoreNLPServer
```

## 3. Hagamos algunas pruebas

Abrir [la consola web de CoreNLP](http://localhost:9000/), y probar los siguientes ejemplos:

#### 3.1. Ejemplo Valentina

> Yo quiero un sánguche.

#### 3.2. Un ejemplo con Semgrex

> Yo quiero un sánguche de jamón y queso.
> Carlos pide un omelette con huevo.
> Para mi vieja preparame un caldo con pollo.

```
# Semgrex
({pos:/vmip000/}=intent >/nsubj|iobj/ {pos:/(np|pp|nc0s)\d+/}=who >dobj ({pos:/.*/}=thing >nmod {pos:/nc.*/}=ingredient))
```

#### 3.3. Ejemplo Carlitox

> Hola dame una hamburguesa con gaseosa mediana y sin papas.

#### 3.4. Ejemplo Alejo

> La quiero con mayonesa, sin kétchup y con mostaza.
> Dejale el tomate, pero sacale la lechuga y la carne.
> Dejale el oregano, pero reemplazame la cebolla por la gaseosa.
> Y agrandame las papas y cambiámelas por un cono de vainilla.
> Y si no tenés de vainilla ponele kétchup a la comida y agrandame el menú por 50 centavos.
> Pero no le pongas condimentos al helado porque vengo del cine y ella se llama Valentina.
