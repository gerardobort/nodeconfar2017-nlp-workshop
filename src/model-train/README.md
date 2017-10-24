# Modelado del parser de pedidos Mc King

## 1. Configuración de RegexNER

En `$WORKSHOPMODELPATH/mcking-regexner.tsv` tenemos un ejemplo de configuración `.tsv` de dos columnas con expresiones regulares y sus etiquedas.

Al ejecutar el Pipeline de CoreNLP con dicho modelo, el parser etiquetará las entidades en base a las expresiones (ver `$WORKSHOPMODELPATH/StanfordCoreNLP-spanish.properties` para saber cómo configurarlo).

## 2. Entrenamiento del NERClassifierCombiner en CoreNLP

El NERClassifierCombiner no se "configura", sino que se lo "entrena".  Es un modelo de redes neuronales baado en MRF ó CRF, el cual es supervisado.

En los siguientes pasos vamos a ver cómo entrenar dicho modelo para ajustarlo a la solución de nuestro problema: *Las diferentes expresiones sobre cómo hacer un pedido de comida son muy variadas y complejas de estructurar, por lo que RegexNER no sereia una solución viable*.

### 2.1. Crear texto de entrenamiento (entrada para training set)

Ir a la carpeta `src/model-train`, ahora trabajaremos desde allí.

Crear un archivo con todas las expresiones (sentencias / text) usadas para el entrenamiento.  El archivo (un `.txt`), no tiene que tener ningún formato especial.

Tomaremos como base, los pedidos de comida de [este documento](https://docs.google.com/document/d/1Gh1tBee2WI1AyRcPq_ETxRvxw1NPsFUo8ac50t1xDUc/edit?usp=sharing)

### 2.2. Tokenizar

El siguiente proceso generará un archivo `.tok` en el cual quedará cada token o "palabra" en una nueva línea.

```bash
java edu.stanford.nlp.process.PTBTokenizer ner-crf-orders.txt > ner-crf-orders.tok
```

### 2.3. Preparar archivo `.tok`, generar `.tsv` de entrenamiento

El archivo creado en el paso anterior no hace una separación especial entre sentencias.  NERClassifierCombiner espera que cada sentencia quede delimitada por un doble salto de línea.  Para ello, haremos lo siguiente:

```bash
# abrimos el archivo con vim
vim ner-crf-orders.tok
```

Una vez en Vim...

```vim
" agregamos un salto de línea extra a cada final de sentencia (previo asegurarnos que cada sentencia del trainig set tenga un punto al final)
:%s/\.$/.\r/

" para ahorrar tiempo en la próxima tarea, agregamos el background symbol "O" a todos los tokens, separados por un tab
:%s/.$/\0\tO/

" guardamos el archivo como `.tsv`, sí ahora es un archivo `.tsv`
:w ner-crf-orders-1.tsv

" agregamos las clases NER a cada token que creamos conveniente y luego lo guardamos con un nombre diferente para no perder lo anterior (por las dudas)
:w ner-crf-orders-2.tsv
```

### 2.4. Entrenar el Conditional Random Field Classifier

```bash
## previo a lo que sige, darle una mirada a `ner-train.prop`

java edu.stanford.nlp.ie.crf.CRFClassifier -prop ner-train.prop

## se generará un archivo en `$WORKSHOPMODELPATH/mcking-ner.crf.ser.gz` (ver ner-train.prop settings)
```

#### 2.4.1. Anexo: Resultados de entrenamiento

```
# ner-crf-orders-2.tsv 👍
# Tiene NER tags por palabras sueltas 
CRFClassifier tagged 509 words in 51 documents at 6362.50 words per second.
         Entity	P	R	F1	TP	FP	FN
        DESSERT	1.0000	1.0000	1.0000	1	0	0
          ORDER	0.7174	0.8049	0.7586	33	13	8
      ORDER_ADD	0.6744	0.8923	0.7682	58	28	7
   ORDER_MUTATE	1.0000	1.0000	1.0000	2	0	0
   ORDER_REMOVE	0.8571	1.0000	0.9231	6	1	0
         Totals	0.7042	0.8696	0.7782	100	42	15
```

```
# ner-crf-orders-2b.tsv 👍 👍
# Tiene NER tags por grupos de palabras
CRFClassifier tagged 551 words in 54 documents at 2946.52 words per second.
         Entity P R F1  TP  FP  FN
          ORDER 0.9783  1.0000  0.9890  45  1 0
      ORDER_ADD 0.8488  1.0000  0.9182  73  13  0
   ORDER_MUTATE 0.6667  1.0000  0.8000  2 1 0
   ORDER_REMOVE 1.0000  1.0000  1.0000  7 0 0
         Totals 0.8944  1.0000  0.9442  127 15  0
```

```
# ner-crf-orders-2c.tsv 👍 👍
# Tiene NER tags por grupos de palabras, no distingue de ORDER a ORDER_ADD
CRFClassifier tagged 509 words in 51 documents at 8079.37 words per second.
         Entity	P	R	F1	TP	FP	FN
        DESSERT	1.0000	1.0000	1.0000	1	0	0
      ORDER_ADD	0.8908	0.9907	0.9381	106	13	1
   ORDER_MUTATE	1.0000	1.0000	1.0000	2	0	0
   ORDER_REMOVE	0.8571	0.8571	0.8571	6	1	1
         Totals	0.8915	0.9829	0.9350	115	14	2
```

### 2.5. Probar el modelo entrenado, luego de haber sido entrenado (opcional)

```bash
java edu.stanford.nlp.ie.crf.CRFClassifier -loadClassifier $WORKSHOPMODELPATH/mcking-ner.crf.ser.gz -testFile testset.tsv
```

## 3. Combinar nuestro modelo con el Spanish default de CoreNLP

En este paso haremos un "merge" del modelo `stanford-spanish-corenlp-2017-06-09-models.jar` con nuestros RegexNER y NER customizados.

Recordemos que el modelo estándar además de RegexNER y NER también agrega POS Tagger, Constituency Parser, Dependency Parser, etc.

Lo que haremos es extraer los archivos del `.jar` (como si fuera un `.zip`) y los colocaremos dentro de `$WORKSHOPMODELPATH/`.  Cuando nos pregunte si deseamos sobreescribir `StanfordCoreNLP-spanish.properties` *DIREMOS QUE NOO*.

```
unzip $CORENLPPATH/stanford-spanish-corenlp-2017-06-09-models.jar -d $WORKSHOPMODELPATH
```

Nota: para el proyecto ya hemos tomado los recaudos de excluir estos archivos en `.gitignore`.

## 4. Correr CoreNLP con el nuevo modelo

```bash
cd $WORKSHOPMODELPATH
java -Xmx4g edu.stanford.nlp.pipeline.StanfordCoreNLPServer
```


## 5. Análisis y estructuración de los datos con Semgrex

Basándonos en el modelo de NER `ner-crf-orders-2b.tsv` y regexner para la clasificación de MEAL, INGREDIENT, CONDIMENT, DRINK y DESSERT, a continuación presentamos las expresiones que resultaron más convenientes.

### 5.1. Búsqueda de expresiones útiles

#### 5.1.1. 1er caso, órden de comida, postre o bebida (con posibles agregados)

```txt
# ORDER main semgrex expression
{ner:ORDER}=order
  >dobj ({}=thing ?>/(nummod|nmod|det)/ {pos:/^(dn|pn|pi|di|z)0*/}=quantity ?>/(appos|amod)/ {ner:SIZE}=size)
  ?>neg {}=negate
  ?>nsubj {pos:/(?!i)/}=who
  [
    ?@{}
    | >>nmod ({ner:/(INGREDIENT|CONDIMENT?|DRINK|DESSERT|MEAL)/}=extra_thing
      ?>case {}=addrem
      ?</(nummod|nmod|det)/ {pos:/^(dn|pn|pi|di|z)0*/}=quantity
      ?>/(appos|amod)/ {ner:SIZE}=size
      ?>neg {}=negate)
  ]
```

#### 5.1.2. 2do caso, agregar/quitar ingredientes, condimientos, postro o bebida a la comida

```txt
# ORDER_ADD / ORDER_REMOVE semgrex expression
{ner:/^ORDER_(ADD|REMOVE)/}=addrem
  >dobj ({}=extra_thing
    ?>/(nummod|nmod|det)/ {pos:/^(dn|pn|pi|di|z)0*/}=quantity
    ?>/(appos|amod)/{ner:SIZE}=size
    ?>nmod {ner:/MEAL|INGREDIENT|CONDIMENT|DESSERT|DRINK/}=replace_by)
  ?>nsubj {}=who
  ?>neg {}=negate
  ?>/(iobj|nmod)/ {ner:/(MEAL|DESSERT|DRINK)/}=thing_to
```

#### 5.1.3. 3er caso, agrandar combo, comida, o cualquier otra transformación

```txt
# ORDER_ADD / ORDER_REMOVE semgrex expression
{ner:ORDER_MUTATE}=mutate
  >dobj {ner:/MEAL|INGREDIENT|DESSERT|DRINK/}=thing
  ?>nsubj {}=who
```

### 5.2. Combinando los 3 casos en una sola expresión

```txt
{ner:/^ORDER.*/} [
  == ({ner:ORDER}=order
    >dobj ({}=thing ?>/(nummod|nmod|det)/ {pos:/^(dn|pn|pi|di|z)0*/}=quantity ?>/(appos|amod)/ {ner:SIZE}=size)
    ?>neg {}=negate
    ?>nsubj {pos:/(?!i)/}=who
    [
      ?@{}
      | >>/(nmod|conj.*)/ ({ner:/(INGREDIENT|CONDIMENT?|DRINK|DESSERT|MEAL)/}=extra_thing
        ?>case {}=addrem
        ?</(nummod|nmod|det)/ {pos:/^(dn|pn|pi|di|z)0*/}=quantity
        ?>/(appos|amod)/ {ner:SIZE}=size
        ?>neg {}=negate)
    ])

  | == ({ner:/ORDER_(ADD|REMOVE)/}=addrem
    >dobj ({}=extra_thing
      ?>/(nummod|nmod|det)/ {pos:/^(dn|pn|pi|di|z)0*/}=quantity
      ?>/(appos|amod)/ {ner:SIZE}=size
      ?>nmod {ner:/MEAL|INGREDIENT|CONDIMENT|DESSERT|DRINK/}=replace_by)
    ?>nsubj {}=who
    ?>neg {}=negate
    ?>/(iobj|nmod)/ {ner:/(MEAL|DESSERT|DRINK)/}=thing_to)

  | == ({ner:ORDER_MUTATE}=mutate
    >dobj {ner:/MEAL|INGREDIENT|DESSERT|DRINK/}=thing
    ?>neg {}=negate
    ?>nsubj {}=who)
]
```

### 5.3. Estructuración de las órdenes (DecisionTree)

#### 5.3.1. Boceto de la estructura que buscamos

El siguiente `JSON` de ejemplo, sirve para entender a priori, cómo quedaría nuestra estructura una vez agregados todos los matches de nuestro pedido compuesto con múltiples sentencias.

```json
{
  "who": { },
  "thing": {
    "token": { },
    "quantity": { "token": { } },
    "negate": { "token": { } }
  },
  "extra_things": [
    {
      "token": { },
      "quantity": { "token": { } },
      "negate": { "token": { } },
      "thing_to": { "token": { } }
    }
  ]
}
```

#### 5.3.2. Algoritmo para agregar órdenes resultando en la estructura propuesta

```txt
ordenes = []
mutaciones = []
última orden = null
Iteramos sobre cada sentencia, en orden de aparición
  si encontramos una ORDER: // 1er caso
    si orden = última orden: // comparar usando token identity
      última orden . extra_things [ ] <- orden . extra_thing
    caso contrario:
      última orden <- orden
      última orden . thing = orden . thing
      última orden . thing . quantity = orden . quantity
      última orden . thing . size = orden . size
      última orden . thing . negate = orden . negate
      última orden . who = orden . who
      última orden . extra_things <-  [ orden . extra_thing ]
      ordenes [ ] <- última orden
  caso contrario y si encontramos un addrem: // 2do caso
    extra thing = addrem
    extra_thing . replace_by = orden . replace_by
    extra_thing . thing_to = orden . thing_to
    extra_thing . quantity = orden . quantity
    extra_thing . size = orden . size
    extra_thing . negate = orden . negate
    última orden . extra_things [ ] <- extra_thing
  caso contrario y si encontramos un mutate: // 3er caso
    mutación <- orden
    mutación . thing = orden . thing
    mutación . who = orden . who
    mutación . negate = orden . negate
    mutaciones [ ] <- mutación
```

