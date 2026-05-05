# Omni Hotels Homepage Migration Plan

## Overview

Migrate the homepage of **https://www.omnihotels.com/** to AEM Edge Delivery Services. This is a single-page migration starting from a fresh EDS project (based on the AEM Block Collection boilerplate already present in the workspace).

## Source

- **URL:** https://www.omnihotels.com/
- **Page:** Homepage
- **Type:** Single page migration

## Current Project State

The workspace contains an AEM Block Collection boilerplate project with:
- Standard blocks: hero, cards, columns, carousel, tabs, accordion, quote, embed, video, form, table, modal, header, search, fragment
- Global styles and scripts already configured
- No existing content directory or import infrastructure
- No `page-templates.json` or `tools/importer/` directory yet

## Migration Approach

This migration will follow the standard EDS content migration workflow:

1. **Site Analysis** — Identify the page template pattern for the homepage
2. **Page Analysis** — Analyze the homepage to identify content structure, sections, block variants, and authoring decisions
3. **Block Mapping** — Map detected content patterns to EDS blocks (existing or new variants)
4. **Design Migration** — Extract and adapt the site's design system (colors, typography, spacing) to EDS styles
5. **Import Infrastructure** — Generate block parsers and page transformers for the content import
6. **Content Import** — Execute the import to produce the final HTML content
7. **Preview & Validation** — Verify the migrated page renders correctly in the local dev server

## Checklist

- [ ] Run site analysis on https://www.omnihotels.com/ to create page template skeleton
- [ ] Run page analysis on the homepage to identify sections, blocks, and content structure
- [ ] Map detected blocks to existing EDS blocks or create new variants
- [ ] Extract and migrate design system (colors, fonts, spacing, global styles)
- [ ] Generate import infrastructure (block parsers + page transformers)
- [ ] Execute content import to produce HTML in the content directory
- [ ] Start local dev server and preview the migrated homepage
- [ ] Validate visual fidelity against the original site
- [ ] Fix any styling or structural issues identified during validation

## Key Considerations

- **Block Reuse:** The project already has hero, cards, columns, carousel, and other common blocks — these will be reused where possible
- **New Variants:** The Omni Hotels homepage likely has hotel-specific patterns (booking widgets, property showcases, loyalty program CTAs) that may require new block variants
- **Design Tokens:** Typography, colors, and spacing will be extracted from the source site and mapped to CSS custom properties in `styles/styles.css`
- **Navigation:** Header/footer navigation will be handled via the navigation expert skill
- **Images:** All referenced images will be downloaded and organized during import

## Execution

This plan requires **Execute mode** to proceed with implementation. Switch to Execute mode to begin the migration workflow.
