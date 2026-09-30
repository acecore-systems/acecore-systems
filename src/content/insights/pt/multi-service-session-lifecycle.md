---
title: "Alinhar a validade do login entre serviços: renovação e reautenticação"
description: "Desenho geral de validade de login, separando acesso explícito, servidor, cookies e provedor de identidade."
date: "2026-09-30T13:37:47+00:00"
author: gui
image: /images/insights/multi-service-session-lifecycle.webp
tags: ["Authentication", "Session", "Web"]
callout:
  type: note
  title: "Caso interno generalizado"
  text: "Baseado em mudanças de política e publicação em produção. Prazos e configurações internas são omitidos; não comprova comportamento prolongado de todos os usuários nem segurança integral."
---

Usar uma conta comum não torna idênticas as sessões das aplicações e do provedor de identidade. O caso alinha regras sem publicar destinos ou prazos.

## Identificar cada prazo

Inventarie separadamente a sessão do provedor, a sessão da aplicação e o cookie. Expiração absoluta, inatividade e rotação do identificador são controles diferentes. Trocar o identificador não exige estender a validade.

## Separar login explícito e acesso comum

O caso renova o período aplicável após um login explícito bem-sucedido, não por navegação, tráfego de fundo, renovação automática de tokens ou rotação do identificador; esses mantêm o prazo original. Um clique ou chegada ao callback não comprova autenticação: valide o resultado. Quando autenticação recente for necessária, verifique se reutilizar a sessão do provedor atende ao requisito.

## Aplicar a validade no servidor

Um cookie mais duradouro não define o período aceito pelo servidor. Confira prazo, revogação, cookie e limites do provedor. Regras iguais não implicam cookie compartilhado ou logout imediato em todos os serviços.

Valide o horário de autenticação e expiração da autoridade e limite a eles as sessões das aplicações. O contrato comum valida sessões; permissões de negócio continuam em cada aplicação. Um gateway com cookie próprio tem outro limite a inventariar e auditar.

## Separar configuração e comportamento

Audite código e ajustes separadamente dos testes de login, limites de validade, login após expiração e logout. Confira quando a nova regra se aplica a sessões existentes e como páginas e APIs tratam a expiração. Registre decisões e horários, sem valores de sessão ou credenciais.

## Escopo confirmado

O histórico registra mudanças, publicação e ferramentas para auditar diferenças. Os registros não incluem login de usuários reais nem espera até a expiração efetiva. Não demonstra testes de tempo real em todos os dispositivos nem toda a segurança da revogação e reautenticação. Escolha prazos e verificações conforme dados e operações.

Consulte [sessões OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) e [autenticação](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). Para outra camada, veja [sessões Cloudflare](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/). As recomendações não significam que cada teste foi concluído neste caso.
