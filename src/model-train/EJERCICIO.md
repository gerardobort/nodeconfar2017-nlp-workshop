# Ejercicio Final Workshop: Mc King Pizza

## 1. Agregar al modelo RegexNER (../model/mcking-regexner.tsv)

Verificar la mejora pidiendo cualquier combinación de estas comidas con ingredientes.

### Comidas

1. Pizzas
2. Empanadas

### Ingredientes

1. Albahaca
2. Provolone
3. Choclo
4. Acelga
5. Roquefort
6. Apio

## 2. Agregar al modelo CRF-NER (ner-crf-orders-2b.tsv)

Verificar la mejora con el reporte de test (valor F1).

```tsv
Voy	ORDER
a	ORDER
pedir	ORDER
te	ORDER
dos	O
pizzas	O
con	ORDER_ADD
papas	O
,	O
una	ORDER_ADD
gaseosa	O
.	O

Quiero	ORDER
20	O
pizzas	O
de	ORDER_ADD
muzzarella	O
con	ORDER_ADD
papas	O
y	ORDER_ADD
gaseosa	O
.	O

Quiero	ORDER
una	O
pizza	O
de	ORDER_ADD
muzzarella	O
y	ORDER_ADD
tomate	O
.	O
```

## 3. Agregar Tamaños a las cosas (SIZE)

### 3.1. Agregar al modelo RegexNER (../model/mcking-regexner.tsv)

1. chico/a
2. pequeño/a
3. mediano/a
4. grande/a
5. gigante

### 3.2. Hacer los cambios necesarios en Semgrex, backend y frontend para soportar la nueva feature.

Ver `src/api/order-model.js`.
