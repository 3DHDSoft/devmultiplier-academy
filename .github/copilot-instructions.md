# CodeGenerator Project Instructions

## Project Overview

**CodeGenerator** is a C# code generation toolkit that enables writing code generators using plain C# instead of markup-based templating engines. It provides a hybrid approach combining programmatic control with markup-style simplicity.

### Core Architecture

The project is organized into several major components:

- **Core Libraries** (`src/Core/`): Foundation classes for code generation
  - `CodeGenerator` (CodeGenerator.Core): Core library with `ICodegenContext`, `ICodegenTextWriter`, template rendering
  - `CodeGenerator.Runtime`: Runtime utilities, dependency injection, logging
  - `CodeGenerator.Models`: Base model interfaces (`IInputModel`, `IJsonInputModel`, `IModelFactory`)
  - `CodeGenerator.DotNet`: .NET-specific code generation helpers

- **Integration Tools** (`src/`):
  - `SourceGenerator/`: Roslyn source generator wrapper - runs templates during compilation
  - `MSBuild/`: MSBuild task (`CodegenBuildTask`) - runs `*.csx` templates during build
  - `Tools/Cli/`: Command-line tool (`code-generator`) for template management and execution
  - `VisualStudio/`: VS extension for template editing and execution

- **Models** (`src/Models/`):
  - `CodeGenerator.Models.DbSchema`: Database schema representation
  - `CodeGenerator.Models.DbSchema.Extractor`: Extract schemas from MSSQL/PostgreSQL
  - `CodeGenerator.Models.NSwagAdapter`: OpenAPI/Swagger model integration

- **Samples** (`Samples/`): Working examples of MSBuild, Source Generator, and prebuild event usage

## Framework

- .NET 10 RC1
- System.CommandLine 2.0.0-rc.1.25451.107 at https://github.com/dotnet/dotnet/tree/release/10.0.1xx-rc1/src/command-line-api

## Key Concepts

### Template Execution Model

Templates are C# classes with a `Main()` entry point. Both constructors and `Main()` support dependency injection:

```csharp
class MyTemplate
{
    void Main(ICodegenContext context)  // or ICodegenTextWriter for single-file
    {
        context["MyClass.cs"].WriteLine($$"""
            public class MyClass { }
            """);
    }
}
```

**Automatic injection types:**
- `ICodegenContext` - multi-file output manager
- `ICodegenTextWriter` - single-file output writer
- `ICodegenOutputFile` - direct file writer reference
- `GeneratorExecutionContext` - Roslyn syntax tree access (Source Generator only)
- `IModelFactory` - for loading models
- `IJsonInputModel` implementations - auto-deserialized from JSON files
- `CommandLineArgs` / `IAutoBindCommandLineArgs` - CLI arguments
- `ExecutionContext` / `VSExecutionContext` - runtime context info

### CodegenTextWriter Magic

`ICodegenTextWriter` accepts `FormattableString` (interpolated strings) and provides:

1. **Smart interpolation**: Can embed delegates (`Action<>`, `Func<>`), enumerables, and nested templates
2. **Automatic indentation**: Captures indentation before interpolated objects, applies to all lines
3. **Hybrid templates**: Seamlessly switch between markup (interpolated strings) and programmatic code

Example:
```csharp
writer.WriteLine($$"""
    public class {{className}}
    {
        {{() => GenerateProperties()}}  // Delegate - maintains indentation
    }
    """);
```

### Template File Formats

- **`.csx`**: C# script files - compiled on-the-fly by CLI, MSBuild task, or Source Generator
- **`.cs`**: Regular C# files - must be compiled to DLL first
- **`.dll`**: Compiled templates - fastest execution

### Build System

**Build orchestration** (`src/build.ps1`):
1. Checks for .NET SDK and .NET Framework 4.7.2+
2. Builds external dependencies (System.CommandLine fork)
3. Builds core libraries → models → tools → source generator → MSBuild → VS extension
5. For Release: uses `release.snk`, for Debug: uses `debug.snk` with `InternalsVisibleTo`

**Component-specific builds**: `build-core.ps1`, `build-models.ps1`, `build-tools.ps1`, etc.

## Development Workflows

### Building the Solution

```powershell
cd src
.\build.ps1 -configuration Debug  # or Release
.\build.ps1 -RunTests             # Include unit tests
```

**Configuration detection**: Automatically uses Release if `Release.snk` exists, otherwise Debug.

### Working with Templates

**From CLI:**
```powershell
# Clone a template
code-generator template clone <url-or-name>

# Run from source (compiles on-the-fly)
code-generator template run Template.csx model.json

# Build to DLL
code-generator template build Template.csx

# Run from DLL (faster)
code-generator template run Template.dll model.json
```

**MSBuild Integration:**
- Add `CodeGenerator.MSBuild` package
- Place `*.csx` files in project folder
- Automatically runs during `BeforeCompile` target

**Source Generator Integration:**
- Add `CodeGenerator.SourceGenerator` package
- Add templates as `<AdditionalFiles>` with `CodegenCSOutput` metadata
- `CodegenCSOutput="Memory"` - in-memory only (not saved to disk)
- `CodegenCSOutput="File"` - saves to disk

### Testing

- Core tests: `src/Core/CodeGenerator.Tests/`
- Tool tests: `src/Tools/Tests/` and `src/Tools/CodeGenerator.Tools.CliTool.Tests/`
- Use `BaseTest` class for template testing infrastructure
- Tests use temp folders, compile templates to temp DLLs, verify output

### Database Schema Extraction

```powershell
code-generator model dbschema extract mssql "Server=...;Database=...;..." output.json
code-generator model dbschema extract postgresql "Host=...;Database=...;..." output.json
```

Templates can then inject `DatabaseSchema` model to generate POCOs, DAL, etc.

## Project-Specific Conventions

### Namespace Strategy
- Main namespace: `CodeGenerator` (no more dots)
- Sub-namespaces match folder structure
- Automatic namespace detection in `RoslynCompiler.cs` via regex patterns
- Templates automatically get common namespaces added if certain patterns detected

### Assembly Signing
- Debug builds: `debug.snk` (PublicKeyToken=f75721f2e3128173)
- Release builds: `release.snk` (PublicKeyToken=602c64961bdc076c)
- `InternalsVisibleTo` configured in Debug mode for test assemblies

### File Naming
- Generated files typically use `.g.cs` or `.generated.cs` suffix
- Templates use `.csx` (C# script) or `.cs` extension

### Dependency Injection Pattern
- Use `DependencyContainer` (custom DI, not Microsoft.DI)
- Register with `RegisterSingleton<T>()` or `RegisterSingleton<T>(Func<T>)`
- Templates resolve dependencies via constructor or `Main()` parameters

### Documentation Location
- Component READMEs in each project folder: `src/Core/CodeGenerator/README.md`, etc.
- Conceptual docs in `docs/`: `Hybrid-Templates.md`, `Indent-Control.md`, `CodegenTextWriter.md`
- Main README at root is minimal - directs to component-specific docs

## Critical Integration Points

### Template Compilation (`RoslynCompiler.cs`)
- Uses Roslyn `CSharpCompilation` to compile templates on-the-fly
- Auto-detects required namespaces via regex patterns
- Loads required assemblies (NSwag, NJsonSchema, etc.)
- Located in `src/Tools/TemplateBuilder/`

### Template Launcher (`TemplateLauncher.cs`)
- Discovers `Main()` entry points via reflection
- Builds dependency container, resolves parameters
- Handles return types: `void`, `int`, `string`, `FormattableString`
- Saves output files based on context type

### Source Generator (`CodegenGenerator.cs`)
- Implements Roslyn `ISourceGenerator`
- Processes `AdditionalFiles` with `.csx`/`.cs`/`.cgcs` extensions
- Checks `CodegenCSOutput` metadata: "Memory" or "File"
- Uses `TemplateBuilder` + `TemplateLauncher` internally

### MSBuild Task (`CodegenBuildTask.cs`)
- Searches for `*.csx` files in project directory
- Compiles and executes during `BeforeCompile`
- Adds generated files to compilation (`_compileFiles`)

## Common Pitfalls

1. **Template indentation**: Don't manually indent delegate callbacks - `ICodegenTextWriter` handles it automatically
2. **Multiple outputs**: Use `ICodegenContext`, not `ICodegenTextWriter`, for multi-file generation
3. **Dependency resolution**: Ensure required types are registered in `DependencyContainer` before template execution
4. **Build order**: Core → Models → Tools/SourceGenerator/MSBuild - don't build out of order

## References

- Main documentation: https://github.com/3DHDSoft/CodeGenerator/
- Template repository: https://github.com/CodeGenerator/Templates/
- NuGet packages: `code-generator`, `CodeGenerator.Core`, `CodeGenerator.SourceGenerator`, `CodeGenerator.MSBuild`

---

_DevMultiplier Academy - CodeGenerator Project Instructions_