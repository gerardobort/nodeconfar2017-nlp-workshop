FROM frekele/java:jdk8
MAINTAINER Gerardo Bort <gerardobort@gmail.com>

WORKDIR /opt/

RUN apt-get update && \
    apt-get install -y ant git

# build latest CoreNLP master
RUN git clone https://github.com/stanfordnlp/CoreNLP && \
    cd CoreNLP && \
    ls -lah && \
    ant 

WORKDIR /opt/CoreNLP

ENV PORT 9000
EXPOSE $PORT

CMD java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer --port $PORT --timeout 10000
