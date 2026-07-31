---
title: "Lições práticas aprendidas ao implementar o Cloudflare Vectorize em vários repositórios"
description: "Reunimos as lições dos registros de implementação e testes do Cloudflare Vectorize em vários sites Astro／Cloudflare Pages: divisão de responsabilidades com o Pagefind, geração de corpus a partir do HTML público, sincronização incremental segura, separação entre Preview／Production, proteção da API e critérios de validação."
date: 2026-07-30T22:50
author: gui
tags:
  ["Tecnologia", "Cloudflare", "Vectorize", "Workers AI", "Pesquisa interna"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Pesquisa fail-soft; sincronização e publicação fail-closed
  text: "Na pesquisa voltada ao usuário, mantemos o Pagefind disponível mesmo quando o Vectorize falha. Já a sincronização do index e a publicação em Production são interrompidas se não for possível confirmar o ambiente de destino, o corpus, a taxa de exclusão, o commit publicado e a conclusão das mutations. Esse projeto assimétrico foi o que mais ajudou ao expandir a solução para vários sites."
processFigure:
  eyebrow: Vectorize rollout
  title: Fluxo do HTML público até o index de Production
  description: "Em vez de inserir diretamente a fonte de edição, usamos como referência para a sincronização o HTML que realmente será publicado e o commit já implantado."
  variant: inline
  steps:
    - title: Fazer o build do HTML público
      description: "Gerar HTML estático que reflita canonical, locale e noindex."
      icon: i-lucide-file-code-2
      accent: slate
    - title: Criar o corpus de forma determinística
      description: "Dividir o texto em chunks e adicionar IDs derivados de content hash e metadata para auditoria."
      icon: i-lucide-boxes
      accent: brand
    - title: Sincronizar em Preview
      description: "Fazer upsert com um index e token dedicados e verificar API, resultados vazios, fallback e rate limit."
      icon: i-lucide-flask-conical
      accent: amber
    - title: Sincronizar o commit publicado em Production
      description: "Comparar o build marker com a corpus version e ativar somente depois da convergência das mutations."
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: Pesquisa e sincronização exigem políticas diferentes em caso de falha
  before:
    label: Depender de Vectorize para tudo
    items:
      - "Se AI, Vectorize ou D1 parar, toda a pesquisa interna deixa de funcionar"
      - "A diferença entre o rascunho do CMS e a página publicada aparece diretamente nos resultados"
      - "Uma configuração incorreta do script de sincronização pode alterar outro ambiente ou um grande número de vectors"
      - "É fácil considerar a implementação concluída assim que o código é merged"
  after:
    label: Pesquisa fail-soft ＋ sincronização fail-closed
    items:
      - "Usar Pagefind para a pesquisa normal e chamar a pesquisa semântica apenas por uma ação explícita"
      - "Criar o corpus a partir do HTML público, refletindo canonical, noindex e locale"
      - "Validar allowlist de ambientes, taxa de exclusão, commit publicado e conclusão das mutations antes e depois da sincronização"
      - "Registrar implementação, validação local, Preview e operação em Production como estados diferentes"
statBar:
  items:
    - value: "4 repos"
      label: Registros de implementação e testes analisados
      description: "Comparamos Production, validação local, Preview e investigação prévia sem tratá-los como o mesmo estado."
      icon: i-lucide-git-branch
    - value: "36 → 250"
      label: Primeira sincronização de Production do Systems
      description: "Geramos 250 vectors a partir de 36 páginas públicas em japonês e sincronizamos sem exclusões."
      icon: i-lucide-database
    - value: "72 → 134"
      label: Validação local do World Foundation
      description: "Geramos 134 vectors a partir de 72 sources, mas registramos o resultado como anterior à publicação em Production."
      icon: i-lucide-test-tube-2
    - value: "37 tests"
      label: Validação do contrato de pesquisa
      description: "No World Foundation, passaram 37 testes dos contratos de pesquisa, corpus e sincronização."
      icon: i-lucide-badge-check
checklist:
  title: Verificações antes de implementar no próximo repositório
  items:
    - text: "Manter a pesquisa por palavras-chave existente e preservar o caminho de pesquisa quando o Vectorize estiver indisponível"
      checked: true
    - text: "Comparar a saída real do embedding model com dimensions／metric do index"
      checked: true
    - text: "Gerar o corpus a partir do HTML público e excluir noindex, canonical externo e páginas administrativas"
      checked: true
    - text: "Usar IDs derivados de content hash para não recalcular embeddings de chunks sem alterações"
      checked: true
    - text: "Separar index, binding, token e limites de aprovação entre Preview e Production"
      checked: true
    - text: "Confirmar a conclusão do upsert antes do delete e exigir aprovação explícita para exclusões em massa"
      checked: true
    - text: "Definir body, query, locale, origin, rate limit e kill switch na API de pesquisa"
      checked: true
    - text: "Sincronizar em Production somente deployments cujo commit publicado corresponda à corpus version"
      checked: true
    - text: "Registrar separadamente implementado, validado, verificado em Preview e em operação em Production"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Documentação oficial do Cloudflare Vectorize
    description: "Consulte as especificações atuais de index, binding, query e metadata filtering."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Limits atuais do Vectorize
    description: "Os limites de batch, topK, metadata e quantidade de vectors podem mudar; confira-os novamente durante a implementação."
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Arquitetura completa de sites Astro ＋ Cloudflare
    description: "Um artigo que organiza em quais camadas colocar HTML estático, Pages Functions, D1 e pesquisa."
    icon: i-lucide-layers-3
faq:
  title: Perguntas frequentes
  items:
    - question: O Pagefind se torna desnecessário depois de instalar o Vectorize?
      answer: "Não o removemos. Dividimos as funções: Pagefind é a pesquisa normal de baixa dependência, criada a partir de HTML estático; Vectorize é a pesquisa auxiliar para encontrar paráfrases e conceitos relacionados. Assim, a pesquisa normal continua disponível mesmo se AI ou Vectorize falhar."
    - question: D1 ou R2 é obrigatório para implementar o Vectorize?
      answer: "Não. No Systems, usamos D1 para o rate limit da API de pesquisa, mas ele não é um armazenamento obrigatório do próprio Vectorize. O local do texto original também deve ser escolhido conforme os requisitos, entre HTML público, JSON, D1, R2 e outras opções."
    - question: Podemos fixar 1024 dimensions sempre que usamos BGE-M3?
      answer: "Nesta implementação, confirmamos a saída real e padronizamos em 1024 dimensions／cosine. Como a configuração do index não pode ser alterada depois da criação, não deduza apenas pelo nome do modelo: confira a especificação oficial e o shape real da saída no momento da implementação."
    - question: Em que momento a implementação é considerada concluída?
      answer: "Não consideramos merge ou testes locais suficientes. Registramos a operação em Production somente depois de verificar uma consulta real em Preview, a correspondência entre commit publicado e corpus, a sincronização do index de Production, a convergência das mutations, o fallback para Pagefind, o rate limit e o procedimento de interrupção."
---

Ao implementar e testar o Cloudflare Vectorize em vários repositórios, fica claro que apenas “criar embeddings e chamar `query()`” não é suficiente.

Como criar o conteúdo pesquisável, como preservar a pesquisa existente, como separar Preview de Production, como evitar exclusões em massa causadas por uma sincronização incorreta e como confirmar que as páginas publicadas realmente correspondem ao index? Na operação real, o projeto ao redor das chamadas da API do Vectorize foi mais importante do que as chamadas em si.

Este artigo cruza os resultados de implementação e investigação registrados no Acecore Systems, World Foundation, Acecore Schools e Aceserver Portal e os organiza de uma forma reutilizável em outros sites Astro／Cloudflare Pages.

## Conclusão: pesquisa fail-soft; sincronização e publicação fail-closed

O princípio mais fácil de reutilizar foi separar a política de falha entre a pesquisa voltada ao usuário e a sincronização operada pela equipe.

| Alvo                        | Política em caso de falha | Motivo                                                                                             |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| Pesquisa interna normal     | fail-soft                 | Continuar pesquisando com Pagefind mesmo se o Vectorize parar                                      |
| API de pesquisa relacionada | fail-soft                 | Encerrar rapidamente o erro sem danificar os resultados da pesquisa normal                         |
| Geração do corpus           | fail-closed               | Não gerar se páginas, locale, contagem ou metadata estiverem incorretos                            |
| Sincronização do index      | fail-closed               | Não alterar se ambiente, IDs existentes, taxa de exclusão ou mutations não puderem ser confirmados |
| Ativação em Production      | fail-closed               | Ativar somente depois de confirmar o QA de Preview e a correspondência do commit publicado         |

Isso atende simultaneamente a duas condições: “a pesquisa do site continua disponível quando a pesquisa com AI falha” e “a sincronização não altera nem um único item quando há qualquer dúvida”.

## Estado confirmado nos quatro repositórios

Ao transformar registros de implementação em um artigo, também é importante não resumir tudo como “implementado”. Os registros analisados misturavam operação em Production, validação local, preparação de recursos de Preview e investigação prévia.

| Repositório      | Estado registrado e confirmado                                                                      | Aprendizado                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Acecore Systems  | Operação em Production confirmada em 30 de julho de 2026                                            | Uso conjunto com Pagefind, corpus de HTML público, rate limit com D1 e sincronização segura em Production |
| Aceserver Portal | Pesquisa Vectorize de informações da Acecore confirmada em Production                               | Não misturar o destino de pesquisa das informações corporativas com o das regras da WIKI                  |
| World Foundation | 72 sources／134 vectors gerados localmente e 37 tests concluídos. Não publicado                     | content hash, sincronização fail-closed e separação dos critérios anteriores à publicação                 |
| Acecore Schools  | Apenas investigação da configuração existente. Criação do index e implementação ainda não iniciadas | Definir API, corpus, permissões e ambientes antes de adicionar um binding                                 |

No Acecore Systems, dividimos o trabalho em três etapas: [PR de implementação #40](https://github.com/acecore-systems/acecore-systems/pull/40), [PR de preparação de Production #41](https://github.com/acecore-systems/acecore-systems/pull/41) e [PR de ativação de Production #42](https://github.com/acecore-systems/acecore-systems/pull/42).

Na primeira sincronização de Production, o [GitHub Actions run](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752) comparou o commit publicado com a corpus version e gerou 250 vectors a partir de 36 páginas públicas em japonês. O resultado da sincronização foi 250 upserts e 0 deletes. Separar merge do código, preparação do index, primeira sincronização e ativação da pesquisa tornou claras as condições de parada de cada etapa.

## Não substituir o Pagefind: dividir responsabilidades

O objetivo de adotar o Vectorize não era descartar a pesquisa existente.

O Pagefind cria um index estático a partir do HTML gerado e pode pesquisar no navegador. Ele é fácil de usar como pesquisa normal para termos explícitos, como nomes de produtos, serviços e nomes próprios, e não depende do estado de Workers AI ou Vectorize.

O Vectorize é adequado quando o termo pesquisado não corresponde exatamente ao texto ou quando queremos encontrar uma página a partir de um conceito relacionado. No entanto, ele exige a geração de embeddings e uma query ao Vectorize, o que também traz latência de serviços externos, erros e consumo a serem considerados.

Por isso, também separamos a interface.

1. Mostrar sugestões do Pagefind enquanto o usuário digita
2. Chamar a API somente quando o usuário executar explicitamente a pesquisa relacionada
3. Definir um timeout curto na API
4. Não apagar os resultados do Pagefind se a API falhar
5. Permitir que apenas a pesquisa relacionada seja interrompida por um kill switch

Com essa estrutura, o Vectorize amplia a experiência de pesquisa sem se tornar um ponto único de falha para toda a função.

## Criar o corpus a partir do HTML público, não dos rascunhos do CMS

A principal diferença entre os sites estava na escolha da fonte de verdade do conteúdo pesquisável.

Criar o corpus diretamente de rascunhos do CMS ou Markdown causa diferenças em relação às páginas realmente publicadas.

- Conteúdo marcado como `draft` ou `noindex` pode ser incluído
- Páginas que apontam para um canonical externo podem permanecer
- Texto duplicado do layout e interfaces administrativas podem ser incluídos
- title, description e URL que aparecem somente após a conversão não são refletidos
- Os limites de locale ficam ambíguos em sites multilíngues

Por isso, lemos o HTML gerado após o build do Astro e criamos o corpus somente depois de aplicar as condições de publicação.

No Acecore Systems, incluímos apenas páginas em japonês que atendem às condições abaixo.

- Ter canonical same-origin
- Ter `lang` em japonês
- Não estar marcada como `noindex`
- Não ser `/admin`, `/api`, 404 ou uma página de confirmação de envio
- Permitir a exclusão de elementos que não fazem parte do conteúdo, como `data-vectorize-ignore` e navegação
- Ter uma URL pública root-relative e title

Dividimos o texto em chunks com meta de 850 caracteres, máximo de 1,200 e overlap de 120 caracteres. Esses valores não são uma resposta universal; são parâmetros operacionais adotados para o tamanho das páginas e o texto em japonês deste caso. Em outro site, ajuste-os de acordo com a estrutura real dos documentos e a avaliação da pesquisa.

## Tornar a sincronização incremental determinística com content hash

Se os vector IDs forem números sequenciais ou UUIDs gerados durante a execução, até o mesmo corpus produzirá IDs diferentes na próxima geração. Isso recalcula embeddings de texto sem alterações e exige a exclusão em massa dos IDs antigos.

Por isso, criamos SHA-256 a partir de locale, URL pública, número do chunk e texto, gerando deterministicamente o ID e a corpus version.

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

Durante a sincronização, comparamos os IDs esperados com os IDs atuais do index.

- Gerar embeddings e fazer upsert dos IDs que existem apenas no conjunto esperado
- Tratar IDs presentes nos dois lados como inalterados e fazer skip
- Considerar para exclusão os IDs que existem apenas no index
- Interromper antes de qualquer mutation se houver IDs fora do escopo gerenciado `v1-`

Assim, o mesmo conteúdo público produz o mesmo corpus, facilitando a explicação do motivo de cada diferença.

## Fixar o embedding model e as configurações do index como um contrato

Para a pesquisa com conteúdo em japonês, usamos o [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/) do Workers AI e, após confirmar o shape real da saída, padronizamos em 1,024 dimensions／cosine.

Mais importante do que o nome do modelo é manter o mesmo contrato nos quatro pontos abaixo.

| Local                   | Valor fixado                          |
| ----------------------- | ------------------------------------- |
| corpus metadata         | model, dimensions e metric            |
| Vectorize index         | dimensions e metric                   |
| API de pesquisa         | model e embedding length              |
| Script de sincronização | model, dimensions e metric permitidos |

Como descrito em [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) da Cloudflare, dimensions e metric do index não podem ser alterados depois da criação. Se a documentação do modelo for ambígua, não crie o index por suposição: confirme a documentação atual e a saída real.

Ao usar metadata filtering, crie o metadata index antes de inserir os vectors. Os vectors já inseridos não passam a ser incluídos apenas porque um metadata index foi adicionado depois; é necessário fazer o upsert novamente.

Os limits do produto também mudam. Em 30 de julho de 2026, no Vectorize V2, o limite de upsert batch da Workers API era 1,000 e o da HTTP API era 5,000. O limite normal de `topK` era 100 e caía para 50 com `returnValues: true` ou `returnMetadata: "all"`. Durante a implementação, consulte sempre os [limits atuais](https://developers.cloudflare.com/vectorize/platform/limits/) e a [client API](https://developers.cloudflare.com/vectorize/reference/client-api/).

A sincronização do Acecore Systems usa a HTTP API em batches de 200, e a pesquisa usa `topK: 15`; portanto, não tratamos os limites máximos do produto como tamanho de processamento. Decida separadamente o limite do produto e um tamanho de batch que sua equipe consiga repetir e monitorar com segurança.

## Fazer upsert, esperar a convergência e somente então executar delete

As operações insert, upsert e delete do Vectorize são assíncronas. Uma resposta de sucesso da API não significa que a mudança já esteja refletida nas queries.

Definimos a seguinte ordem para uma sincronização segura.

1. Validar o corpus e a configuração do index
2. Obter todos os vector IDs atuais com pagination
3. Calcular os itens para upsert e os candidatos a delete
4. Executar o upsert em batches
5. Esperar até que o `mutationId` retornado alcance `processedUpToMutation`
6. Executar o delete somente depois da convergência do upsert
7. Confirmar também a convergência da mutation de delete

A [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/) da Cloudflare também declara que mutations são assíncronas. Não dependa apenas de um sleep por um número fixo de segundos; use o mutation ID para confirmar a conclusão.

Além disso, incluímos no script as seguintes condições de parada.

- O nome do index de destino está fora da allowlist de Preview／Production
- O processo tenta criar automaticamente um index de Production
- O valor de `--confirm-production` não corresponde ao nome do index de destino
- dimensions／metric diferem do contrato
- locale, URL, metadata ou content hash do corpus é inválido
- A quantidade de source pages ou de vectors excede o limite esperado
- O index existente contém IDs fora do escopo gerenciado
- Mais de 20% dos vectors existentes seriam excluídos
- O limite de retries ou o tempo de espera pela mutation é excedido

Somente quando uma exclusão em massa é intencional usamos um override explícito em uma execução manual. Ele nunca é permitido em um push normal ou schedule.

## Separar Preview e Production também pelas permissões, não só pelo nome

Na separação de ambientes, alterar apenas o nome do index no binding não foi suficiente.

Separamos os seguintes elementos.

- Vectorize index
- Recursos auxiliares como D1
- Wrangler environment
- API token
- GitHub Environment
- concurrency do workflow de sincronização
- repository variable de ativação
- kill switch

Restringimos o token de sincronização a Workers AI Read e Vectorize Write na conta Cloudflare de destino. Production só pode ser executado a partir do `main` protegido e passa pelos reviewers do GitHub Environment.

Isso também envolve um trade-off operacional. Quando o Production Environment exige reviewer, uma sincronização iniciada por schedule também pode ficar aguardando aprovação. Antes de adicionar o cron, é preciso decidir se apenas a primeira publicação será aprovada, se toda sincronização periódica exigirá aprovação ou se haverá jobs separados.

## Sincronizar em Production apenas o corpus do commit que está publicado

O `main` no GitHub e o commit atualmente publicado no Cloudflare Pages nem sempre são iguais. Logo após um push, o build pode ainda estar em andamento; se o deployment falhar, o commit anterior pode continuar publicado.

Por isso, colocamos um build marker no site publicado e verificamos o seguinte durante a sincronização de Production.

- O commit do marker é um Git SHA de 40 caracteres
- O commit existe no repository
- Ele é ancestral do `main` protegido
- É possível fazer checkout desse commit e gerar novamente o corpus
- A corpus version do marker corresponde ao resultado regenerado
- O mesmo commit continua publicado imediatamente antes da mutation

O critério de conclusão é um deployment do Cloudflare Pages conectado ao GitHub repository. Um artefato publicado temporariamente de forma local ou por Direct Upload não serve como referência para a sincronização em Production.

Isso evita divergências como “sincronizar um corpus novo em um site antigo” ou “mostrar nos resultados apenas o conteúdo de um commit cujo deployment falhou”.

## Definir limites de custo e privacidade para a API pública de pesquisa

A API de pesquisa é um endpoint público que envia o texto digitado para Workers AI. Além da precisão, seu projeto precisa considerar abuso, custo, logs e as URLs retornadas.

No Acecore Systems, implementamos os limites abaixo.

| Item             | Exemplo implementado                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| method／formato  | Aceitar somente JSON POST same-origin                                        |
| body             | Até 2KiB; interromper durante a leitura do stream mesmo sem `Content-Length` |
| query            | 2〜160 caracteres depois da normalização NFKC                                |
| locale           | Somente `ja`                                                                 |
| rate limit       | Janela fixa no D1: client 20/min e global 300/min                            |
| interrupção      | Desativar somente a pesquisa relacionada com `SEARCH_ENABLED`                |
| query            | Não armazenar a raw query em logs, corpus ou Vectorize metadata              |
| URL do resultado | Permitir apenas URL pública root-relative e same-origin                      |
| erro             | Retornar um code estruturado por etapa sem registrar o corpo                 |

Um UUID apenas no client não é um limite forte de custo, pois pode ser alterado pelo usuário. Combinamos uma client key derivada das informações de conexão da Cloudflare, um global limit e monitoramento de uso. Dependendo da escala e da ameaça, também podem ser considerados Turnstile, WAF e Durable Objects.

Nesta arquitetura, D1 é usado para rate limit, mas não é obrigatório para implementar o Vectorize. O mesmo vale para R2. Escolha conforme a origem do texto e onde o rate limit precisa ser armazenado.

## Não misturar as responsabilidades das fontes de pesquisa

No Aceserver Portal, separamos as fontes de pesquisa para informações dos serviços da Acecore e para regras e procedimentos do servidor Minecraft.

- Pesquisar dúvidas sobre a Acecore com Vectorize
- Pesquisar regras do servidor na WIKI oficial
- Não fazer fallback para uma resposta irrelevante da WIKI se o Vectorize falhar
- Vincular somente os artigos da WIKI selecionados como evidência
- Não inferir regras que não podem ser confirmadas na WIKI

Isso também é importante em RAG e chats de orientação. Quanto mais fontes pesquisáveis forem adicionadas, mais necessário é decidir previamente para onde enviar cada tipo de pergunta e o que não responder quando não houver informação.

## Falhas reais e o que mudamos depois

Organizamos os problemas que mais tendem a se repetir nos registros dos vários repos.

| Sintoma                                                | Causa                                                      | Próxima ação                                                                                |
| ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Adicionar um binding não produz uma função de pesquisa | API, corpus, reindex, permissões e UI não foram projetados | Definir o contrato de pesquisa e o fluxo operacional antes de criar o index                 |
| dimensions são deduzidas ao criar o index              | O nome do modelo foi usado sem confirmar a saída real      | Verificar o embedding length real antes da criação                                          |
| Vectors existentes não aparecem no metadata filter     | Eles foram inseridos antes do metadata index               | Criar primeiro o metadata index e fazer novo upsert dos vectors existentes                  |
| A query fica instável logo após a sincronização        | A mutation é assíncrona                                    | Aguardar a convergência com `mutationId` e informações do index                             |
| Há muitos embeddings recalculados e deletes            | O vector ID muda a cada execução                           | Usar IDs determinísticos derivados de content hash                                          |
| Um schedule fica parado em waiting                     | O Production Environment exige aprovação                   | Projetar em conjunto a sincronização periódica e a política de aprovação                    |
| Testes ou Git falham no Windows                        | Fatores do ambiente como `spawn EPERM`, lock ou cache      | Separar com comparação de baseline, Node version fixada e um novo `npm ci`                  |
| Um timeout da API é considerado falha do código        | Falha temporária, payload incorreto ou atraso do provider  | Testar novamente com o contrato correto e separar um resultado isolado da reprodutibilidade |

Também é importante não atribuir incorretamente problemas de dependência ou ambiente à mudança do Vectorize. Confirme se o mesmo erro aparece no baseline anterior à alteração e separe falhas do código de falhas do ambiente.

## Registrar “implementado” em quatro etapas

Em artigos e relatórios de conclusão, separar os estados abaixo reduz mal-entendidos.

| Estado                    | Exemplo de condição de conclusão                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Implementado              | API, corpus, script de sincronização e UI existem na branch                                              |
| Validado localmente       | build, typecheck, testes de contrato e dry-run concluídos                                                |
| Verificado em Preview     | Sincronização com recursos de Preview, consulta real e fallback confirmados                              |
| Em operação em Production | Commit publicado sincronizado, convergência das mutations, API e procedimento de interrupção confirmados |

O World Foundation concluiu a validação local, mas não foi registrado como Production porque index, secrets, deployment e browser QA ainda não estavam concluídos. O Schools permaneceu na fase de investigação.

Por outro lado, no Acecore Systems confirmamos PRs em etapas, a primeira sincronização de Production, a ativação em Production, o marker publicado e a API de pesquisa real.

Registrar não apenas o número de testes concluídos, mas também o que ainda não foi verificado, é a informação operacional mais útil para a próxima pessoa responsável.

## Configuração mínima para expandir a outros repositórios

Ao aplicar a solução em outro site Astro／Cloudflare Pages, a configuração mínima se parece com o fluxo abaixo.

```txt
Astro build
  -> HTML público
  -> Pagefind index
  -> Vectorize corpus (reflete locale / canonical / noindex)

Cloudflare Pages Function
  -> input validation
  -> Workers AI embedding
  -> Vectorize query
  -> retorna apenas URLs públicas

GitHub Actions
  -> resolve o commit publicado
  -> regenera o corpus
  -> separa Preview / Production
  -> executa delete após a convergência do upsert
  -> registra a corpus version
```

Não é necessário incluir geração de respostas por LLM desde o início. Primeiro, crie uma pesquisa que “retorne páginas relacionadas com segurança” e possa ser avaliada. Mesmo ao acrescentar geração de respostas, trate o texto obtido, as URLs que podem ser citadas e as condições em que não se deve responder como contratos separados.

## Resumo

A parte difícil da implementação do Cloudflare Vectorize não é a nearest-neighbor query em si.

O que incluir no index como informação pública, como identificar chunks sem alterações, como impedir uma sincronização incorreta, como corresponder ao commit publicado e como preservar a pesquisa normal durante uma falha: esse projeto operacional define a qualidade quando a solução é expandida para vários repos.

Nossa conclusão é simples.

- Manter o Pagefind como pesquisa principal
- Usar o Vectorize como complemento para pesquisa semântica
- Criar o corpus a partir do HTML público
- Gerar ID e version de forma determinística com content hash
- Separar Preview e Production por recursos e permissões
- Tornar a pesquisa fail-soft e a sincronização e publicação fail-closed
- Registrar “implementação”, “validação”, “Preview” e “Production” como estados diferentes

Com essas fronteiras definidas desde o início, fica mais fácil operar o Vectorize não como uma função isolada de AI, mas como uma base de pesquisa que pode ser atualizada continuamente.
