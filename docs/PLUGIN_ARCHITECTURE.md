# Plugin Architecture Documentation

## Overview

AI Detective uses a plugin-based architecture that allows third-party developers and agencies to extend functionality with custom analyzers, pattern detectors, workflows, and integrations.

## Plugin Types

### 1. Pattern Plugins
Detect patterns across cases.

```typescript
interface PatternPlugin {
  findPatterns(targetCase: Case, allCases: Case[]): Promise<PatternMatch[]>
}
```

**Use Cases:**
- Custom pattern matching algorithms
- Domain-specific similarity metrics
- Specialized clustering

### 2. Anomaly Plugins
Detect anomalies and inconsistencies.

```typescript
interface AnomalyPlugin {
  detectAnomalies(caseData: Case): Promise<Anomaly[]>
}
```

**Use Cases:**
- Custom validation rules
- Domain-specific inconsistency checks
- Specialized anomaly detection

### 3. Analyzer Plugins
Perform comprehensive analysis.

```typescript
interface AnalyzerPlugin {
  analyze(caseData: Case, allCases: Case[]): Promise<Analysis>
}
```

**Use Cases:**
- Custom analysis workflows
- Domain-specific analysis
- Specialized reporting

### 4. Workflow Plugins
Execute custom workflows.

```typescript
interface WorkflowPlugin {
  execute(input: any): Promise<any>
}
```

**Use Cases:**
- Agency-specific workflows
- Custom analysis pipelines
- Automated processes

### 5. Integration Plugins
Connect to external systems.

```typescript
interface IntegrationPlugin {
  connect(config: Record<string, any>): Promise<void>
  fetch(query: string): Promise<Case[]>
}
```

**Use Cases:**
- Database connectors
- API integrations
- Data source connections

## Creating a Plugin

### Step 1: Define Your Plugin

```typescript
import { PatternPlugin } from '@/lib/plugins/pluginSystem'
import { Case } from '@/types/case'

export const myPlugin: PatternPlugin = {
  id: 'my-custom-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'Description of what this plugin does',
  author: 'Your Name',
  type: 'pattern',
  enabled: true,

  async findPatterns(targetCase: Case, allCases: Case[]) {
    // Your pattern detection logic
    return []
  },
}
```

### Step 2: Register Your Plugin

```typescript
import { pluginRegistry } from '@/lib/plugins/pluginSystem'
import { myPlugin } from './myPlugin'

pluginRegistry.register(myPlugin)
```

### Step 3: Load Your Plugin

Plugins can be loaded:
- At application startup
- From a plugins directory
- From npm packages
- Dynamically via API

## Plugin Configuration

Plugins can accept configuration:

```typescript
export const myPlugin: PatternPlugin = {
  // ... other properties
  config: {
    threshold: 0.7,
    enabled: true,
  },

  async findPatterns(targetCase: Case, allCases: Case[]) {
    const threshold = this.config?.threshold || 0.5
    // Use threshold in your logic
  },
}
```

## Plugin Discovery

Plugins are discovered from:
1. `lib/plugins/core/` - Core plugins (built-in)
2. `lib/plugins/community/` - Community plugins
3. `lib/plugins/agency/` - Agency-specific plugins
4. npm packages with `ai-detective-plugin` keyword

## Plugin Marketplace (Future)

A plugin marketplace will allow:
- Plugin discovery
- Installation via npm or UI
- Version management
- Community ratings
- Documentation

## Best Practices

1. **Idempotent**: Plugins should be safe to run multiple times
2. **Error Handling**: Always handle errors gracefully
3. **Performance**: Optimize for large datasets
4. **Documentation**: Document your plugin thoroughly
5. **Testing**: Write tests for your plugin
6. **Versioning**: Use semantic versioning

## Example Plugins

See:
- `lib/plugins/core/coldCasePlugin.ts` - Core cold case plugin
- `lib/plugins/examples/fraudPlugin.ts` - Example fraud plugin

## Plugin API Reference

Full API documentation coming soon. See `lib/plugins/pluginSystem.ts` for the current implementation.
