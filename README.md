# ATLAS CLIMA — Gêmeo Digital de Tubarão

Mockup funcional de uma plataforma geoespacial de missão crítica para antecipar eventos climáticos, modelar impactos operacionais e apoiar decisões no Complexo de Tubarão.

## Demonstração

- [GitHub Pages](https://marloshb.github.io/ClimaMin/)
- [Versão privada no Sites](https://atlas-clima-tubarao.marlosbatista.chatgpt.site)

## Capacidades demonstradas

- 13 módulos operacionais integrados.
- Torre de controle com indicadores, riscos e agenda de decisões.
- Mapa operacional baseado no ArcGIS Maps SDK for JavaScript.
- Camadas públicas do ArcGIS Living Atlas.
- Motor de cenários climáticos e modo incidente.
- Agentes de IA para previsão, inconsistências, despacho, vistorias e auditoria.
- Workflows, formulários, relatórios, gráficos e integrações corporativas.

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

## Builds

```bash
# Build da aplicação Sites/Cloudflare
npm run build

# Build estático para GitHub Pages
npm run build:pages
```

O deploy do GitHub Pages é executado automaticamente pelo workflow em `.github/workflows/pages.yml`.
