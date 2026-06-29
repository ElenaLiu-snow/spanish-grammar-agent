# Word 表格行数修复说明

## 问题

Word 表格识别时遗漏行：
- ❌ 第2行被跳过
- ❌ 最后一行被遗漏
- ❌ 空行被忽略

## 原因分析

### 之前的代码问题

```python
# 问题1: 使用 [1:] 切片跳过了第2行
for row in table_data[1:]:  # 跳过第2行！

# 问题2: 条件判断导致空行被跳过
if any(cell for cell in row):  # 空行被跳过！
    data_row = '| ' + ' | '.join(row) + ' |'
```

## 修复方案

### 改进的表格提取逻辑

**关键改进**:
1. ✅ 遍历所有行，不使用切片
2. ✅ 空单元格使用空格占位，保持表格结构
3. ✅ 移除 `if any()` 条件判断
4. ✅ 确保最后一行也被包含

```python
# 遍历所有行（包括第一行和最后一行）
for row_idx, row in enumerate(block.rows):
    row_data = []

    # 遍历所有单元格
    for cell in row.cells:
        cell_paragraphs = [p.text.strip() for p in cell.paragraphs]
        cell_text = ' '.join([p for p in cell_paragraphs if p])

        # 空单元格用空格占位
        if not cell_text:
            cell_text = " "

        row_data.append(cell_text)

    table_rows.append(row_data)  # 添加所有行

# 生成 Markdown 表格
for row_idx, row in enumerate(table_rows):
    markdown_row = '| ' + ' | '.join(row) + ' |'
    result_parts.append(markdown_row)

    # 第一行后添加分隔线
    if row_idx == 0:
        separator = '|' + '|'.join(['---' for _ in row]) + '|'
        result_parts.append(separator)
```

## 测试建议

1. **重新上传你的 Word 文档**
2. **检查表格行数**:
   - 第1行（表头） ✓
   - 第2行 ✓
   - 中间所有行 ✓
   - 最后一行 ✓

3. **验证表格结构**:
   - 列数是否正确
   - 空单元格是否显示
   - 表格线是否完整

## 如果还有问题

如果某些行仍然遗漏，可能的原因：
1. **合并单元格**: Word 中的合并单元格可能导致提取问题
2. **隐藏行**: 某些行可能被设置为隐藏
3. **复杂表格**: 嵌套表格或特殊格式

**解决方案**:
- 可以把表格复制到 Excel，然后另存为 CSV
- 或者手动复制表格内容到纯文本文件
