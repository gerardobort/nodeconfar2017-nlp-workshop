FROM frekele/java:jdk8
MAINTAINER Gerardo Bort <gerardobort@gmail.com>

WORKDIR /opt/

RUN apt-get update && \
    apt-get install -y ant git

# fetch latest CoreNLP master
RUN git clone https://github.com/stanfordnlp/CoreNLP

# build latest CoreNLP master
RUN cd CoreNLP && \
    git pull && \
    ls -lah && \
    ant jar

WORKDIR /opt/CoreNLP

ENV PORT 9000
EXPOSE $PORT

CMD cd /opt/CoreNLP && \
    java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer --port $PORT --timeout 10000
