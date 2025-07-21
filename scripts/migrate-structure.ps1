# Create new directory structure
$directories = @(
    "src/app/components/common",
    "src/app/components/forms",
    "src/app/components/layout",
    "src/app/components/todos",
    "src/app/hooks",
    "src/app/lib/supabase",
    "src/app/lib/constants",
    "src/app/store/slices",
    "src/app/styles",
    "src/app/types",
    "src/app/utils",
    "tests/unit",
    "tests/integration",
    "tests/e2e",
    "config/eslint",
    "config/tailwind",
    "config/typescript",
    "scripts"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force
    Write-Host "Created directory: $dir"
}

# Move files to new structure
$fileMappings = @{
    "app/components/TodoList.tsx" = "src/app/components/todos/TodoList/TodoList.tsx"
    "app/components/TodoItem.tsx" = "src/app/components/todos/TodoItem/TodoItem.tsx"
    "app/components/TodoForm.tsx" = "src/app/components/todos/TodoForm/TodoForm.tsx"
    "app/store/todoStore.ts" = "src/app/store/slices/todoSlice.ts"
    "app/utils/api.ts" = "src/app/lib/supabase/api.ts"
    "app/utils/desktop.ts" = "src/app/utils/desktop.ts"
    "app/globals.css" = "src/app/globals.css"
    "app/layout.tsx" = "src/app/layout.tsx"
    "app/page.tsx" = "src/app/page.tsx"
}

foreach ($source in $fileMappings.Keys) {
    $destination = $fileMappings[$source]
    if (Test-Path $source) {
        $destDir = Split-Path -Parent $destination
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force
        }
        Copy-Item -Path $source -Destination $destination -Force
        Write-Host "Moved file: $source -> $destination"
    } else {
        Write-Host "Source file not found: $source"
    }
}

# Create index files
$indexFiles = @(
    "src/app/components/todos/TodoList/index.ts",
    "src/app/components/todos/TodoItem/index.ts",
    "src/app/components/todos/TodoForm/index.ts",
    "src/app/components/todos/index.ts"
)

foreach ($file in $indexFiles) {
    $content = "export { default } from './" + (Split-Path -Leaf (Split-Path -Parent $file)) + "';"
    if ($file -eq "src/app/components/todos/index.ts") {
        $content = @"
export { default as TodoList } from './TodoList';
export { default as TodoItem } from './TodoItem';
export { default as TodoForm } from './TodoForm';
"@
    }
    Set-Content -Path $file -Value $content
    Write-Host "Created index file: $file"
}

Write-Host "Migration completed successfully!" 