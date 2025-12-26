
/**
 * 🚀 Google Apps Script 后端代码
 * 
 * 使用说明：
 * 1. 创建一个 Google Sheet。
 * 2. 点击“扩展程序” -> “Apps Script”。
 * 3. 删除原有代码，粘贴本文件所有内容。
 * 4. 点击“部署” -> “新建部署” -> 选择“网页应用”。
 * 5. 设置：
 *    - 说明：年会报名后台
 *    - 执行身份：我 (Your email)
 *    - 谁有权访问：所有人 (Anyone)
 * 6. 复制生成的“网页应用 URL”，粘贴到前端 `services/storage.ts` 的 `API_ENDPOINT` 变量中。
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(30000); // 等待锁，防止并发写入冲突
    
    var data = JSON.parse(e.postData.contents);
    
    // 方案一：保存/更新数据
    if (data.action === 'save') {
      var reg = data.registration;
      var rows = sheet.getDataRange().getValues();
      var rowIndex = -1;
      
      // 根据工号（第2列）查找现有行
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] == reg.employeeId) {
          rowIndex = i + 1; // 转换为工作表行索引
          break;
        }
      }
      
      var values = [
        reg.name, 
        reg.employeeId, 
        reg.department, 
        reg.recommendedProgram, 
        reg.programName, 
        reg.programType, 
        reg.participantCount, 
        reg.participantList, 
        reg.timestamp
      ];
      
      if (rowIndex > -1) {
        // 更新现有行
        sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]);
      } else {
        // 初始表头检查
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(['姓名', '工号', '部门', '节目推荐', '节目名称', '节目类型', '参演人数', '名单', '最后更新时间']);
        }
        // 追加新行
        sheet.appendRow(values);
      }
      
      return createJsonResponse({ result: 'success' });
    }
    
    // 方案二：全量获取数据
    if (data.action === 'getAll') {
      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse([]);
      
      var result = [];
      for (var i = 1; i < rows.length; i++) {
        result.push({
          name: rows[i][0],
          employeeId: rows[i][1],
          department: rows[i][2],
          recommendedProgram: rows[i][3],
          programName: rows[i][4],
          programType: rows[i][5],
          participantCount: rows[i][6],
          participantList: rows[i][7],
          timestamp: rows[i][8]
        });
      }
      return createJsonResponse(result);
    }
    
    return createJsonResponse({ result: 'error', message: 'Invalid action' });
    
  } catch (err) {
    return createJsonResponse({ result: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
