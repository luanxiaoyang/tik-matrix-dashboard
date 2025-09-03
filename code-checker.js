const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class CodeChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.frontendPath = path.join(__dirname, 'matrix-dashboard-frontend');
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  addError(file, line, message) {
    this.errors.push({ file, line, message });
  }

  addWarning(file, line, message) {
    this.warnings.push({ file, line, message });
  }

  // 检查Vue文件
  async checkVueFiles() {
    this.log('\n=== 检查Vue文件 ===', 'blue');
    
    const vueFiles = this.findFiles(path.join(this.frontendPath, 'src'), '.vue');
    
    for (const file of vueFiles) {
      await this.checkVueFile(file);
    }
  }

  // 检查单个Vue文件
  async checkVueFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.frontendPath, filePath);
      
      this.log(`检查文件: ${relativePath}`, 'yellow');
      
      // 检查语法错误
      this.checkSyntaxErrors(filePath, content);
      
      // 检查未使用的变量和方法
      this.checkUnusedElements(filePath, content);
      
      // 检查API调用
      this.checkApiCalls(filePath, content);
      
      // 检查组件引用
      this.checkComponentReferences(filePath, content);
      
    } catch (error) {
      this.addError(filePath, 0, `读取文件失败: ${error.message}`);
    }
  }

  // 检查语法错误
  checkSyntaxErrors(filePath, content) {
    // 检查基本的Vue语法问题
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // 检查未闭合的标签
      if (line.includes('<') && !line.includes('</') && !line.includes('/>') && !line.includes('<!--')) {
        const tagMatch = line.match(/<(\w+)[^>]*>/g);
        if (tagMatch) {
          tagMatch.forEach(tag => {
            const tagName = tag.match(/<(\w+)/)[1];
            if (!['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName.toLowerCase())) {
              // 检查是否在同一行或后续行有闭合标签
              const remainingContent = content.substring(content.indexOf(line));
              if (!remainingContent.includes(`</${tagName}>`) && !line.includes('/>')) {
                this.addWarning(filePath, lineNum, `可能存在未闭合的标签: ${tagName}`);
              }
            }
          });
        }
      }
      
      // 检查常见的JavaScript语法错误
      if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
        // 检查变量声明后是否有分号或换行
        if (!line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('(')) {
          const nextLine = lines[index + 1];
          if (nextLine && !nextLine.trim().startsWith('.') && !nextLine.trim().startsWith('[')) {
            this.addWarning(filePath, lineNum, '变量声明可能缺少分号');
          }
        }
      }
      
      // 检查console.log语句（生产环境应该移除）
      if (line.includes('console.log') || line.includes('console.error') || line.includes('console.warn')) {
        this.addWarning(filePath, lineNum, '包含console语句，生产环境应移除');
      }
    });
  }

  // 检查未使用的元素
  checkUnusedElements(filePath, content) {
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (!scriptMatch) return;
    
    const scriptContent = scriptMatch[1];
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
    const templateContent = templateMatch ? templateMatch[1] : '';
    
    // 检查未使用的ref变量
    const refMatches = scriptContent.match(/const\s+(\w+)\s*=\s*ref\(/g);
    if (refMatches) {
      refMatches.forEach(match => {
        const varName = match.match(/const\s+(\w+)/)[1];
        if (!templateContent.includes(varName) && !scriptContent.includes(`${varName}.value`)) {
          this.addWarning(filePath, 0, `未使用的ref变量: ${varName}`);
        }
      });
    }
    
    // 检查未使用的reactive变量
    const reactiveMatches = scriptContent.match(/const\s+(\w+)\s*=\s*reactive\(/g);
    if (reactiveMatches) {
      reactiveMatches.forEach(match => {
        const varName = match.match(/const\s+(\w+)/)[1];
        if (!templateContent.includes(varName) && !scriptContent.split('reactive(')[1].includes(varName)) {
          this.addWarning(filePath, 0, `未使用的reactive变量: ${varName}`);
        }
      });
    }
    
    // 检查未使用的方法
    const methodMatches = scriptContent.match(/const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g);
    if (methodMatches) {
      methodMatches.forEach(match => {
        const methodName = match.match(/const\s+(\w+)/)[1];
        if (!templateContent.includes(methodName) && !scriptContent.includes(`${methodName}(`)) {
          this.addWarning(filePath, 0, `未使用的方法: ${methodName}`);
        }
      });
    }
  }

  // 检查API调用
  checkApiCalls(filePath, content) {
    // 检查API导入
    const apiImports = content.match(/import\s*{[^}]+}\s*from\s*['"]@\/api\/[^'"]+['"]/g);
    if (apiImports) {
      apiImports.forEach(importStatement => {
        const functions = importStatement.match(/{([^}]+)}/)[1]
          .split(',')
          .map(f => f.trim());
        
        functions.forEach(func => {
          if (!content.includes(`${func}(`)) {
            this.addWarning(filePath, 0, `未使用的API导入: ${func}`);
          }
        });
      });
    }
    
    // 检查API调用错误处理
    const apiCalls = content.match(/await\s+\w+\([^)]*\)/g);
    if (apiCalls) {
      apiCalls.forEach(call => {
        const callIndex = content.indexOf(call);
        const beforeCall = content.substring(0, callIndex);
        const afterCall = content.substring(callIndex);
        
        // 检查是否在try-catch块中
        const lastTry = beforeCall.lastIndexOf('try {');
        const lastCatch = beforeCall.lastIndexOf('} catch');
        
        if (lastTry === -1 || lastCatch > lastTry) {
          this.addWarning(filePath, 0, `API调用缺少错误处理: ${call}`);
        }
      });
    }
  }

  // 检查组件引用
  checkComponentReferences(filePath, content) {
    // 检查组件导入
    const componentImports = content.match(/import\s+(\w+)\s+from\s*['"]@\/components\/[^'"]+['"]/g);
    if (componentImports) {
      componentImports.forEach(importStatement => {
        const componentName = importStatement.match(/import\s+(\w+)/)[1];
        const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
        const templateContent = templateMatch ? templateMatch[1] : '';
        
        if (!templateContent.includes(`<${componentName}`) && !templateContent.includes(`<${componentName.toLowerCase()}`)) {
          this.addWarning(filePath, 0, `未使用的组件导入: ${componentName}`);
        }
      });
    }
  }

  // 检查TypeScript类型错误
  async checkTypeScriptErrors() {
    this.log('\n=== 检查TypeScript类型错误 ===', 'blue');
    
    try {
      const result = execSync('npx vue-tsc --noEmit', { 
        cwd: this.frontendPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.log('TypeScript类型检查通过', 'green');
    } catch (error) {
      const output = error.stdout || error.stderr || error.message;
      this.log('TypeScript类型错误:', 'red');
      console.log(output);
      this.addError('TypeScript', 0, 'TypeScript类型检查失败');
    }
  }

  // 检查ESLint错误
  async checkESLintErrors() {
    this.log('\n=== 检查ESLint错误 ===', 'blue');
    
    try {
      const result = execSync('npx eslint src --ext .vue,.ts,.js', { 
        cwd: this.frontendPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.log('ESLint检查通过', 'green');
    } catch (error) {
      const output = error.stdout || error.stderr || error.message;
      if (output.includes('error') || output.includes('Error')) {
        this.log('ESLint错误:', 'red');
        console.log(output);
        this.addError('ESLint', 0, 'ESLint检查失败');
      } else {
        this.log('ESLint检查通过', 'green');
      }
    }
  }

  // 查找文件
  findFiles(dir, extension) {
    const files = [];
    
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && item.endsWith(extension)) {
          files.push(fullPath);
        }
      });
    };
    
    scan(dir);
    return files;
  }

  // 生成报告
  generateReport() {
    this.log('\n=== 检查报告 ===', 'blue');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('✅ 没有发现错误或警告', 'green');
      return;
    }
    
    if (this.errors.length > 0) {
      this.log(`\n❌ 发现 ${this.errors.length} 个错误:`, 'red');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${path.relative(__dirname, error.file)}:${error.line} - ${error.message}`, 'red');
      });
    }
    
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  发现 ${this.warnings.length} 个警告:`, 'yellow');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${path.relative(__dirname, warning.file)}:${warning.line} - ${warning.message}`, 'yellow');
      });
    }
    
    // 保存报告到文件
    const report = {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length
      }
    };
    
    fs.writeFileSync('code-check-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 详细报告已保存到: code-check-report.json', 'blue');
  }

  // 运行所有检查
  async runAllChecks() {
    this.log('🔍 开始代码检查...', 'blue');
    
    await this.checkVueFiles();
    await this.checkTypeScriptErrors();
    await this.checkESLintErrors();
    
    this.generateReport();
  }
}

// 运行检查
if (require.main === module) {
  const checker = new CodeChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = CodeChecker;