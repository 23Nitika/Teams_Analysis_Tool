// server.js
const express = require('express');
const ExcelJS = require('exceljs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Team configurations (should match what's in your front-end)
const teamConfigs = {
  installation: {
    validStatuses: [
      'Installation Partially Completed',
      'Installation Done',
      'Installation Not Done',
      'Installation Completed with Issue'
    ],
    validRemarks: [
      'Material Shortage', 
      'Infra Issue', 
      'Access/owner/Community Issue', 
      'Power Issue', 
      'Mount Issue', 
      'Environmental Issue(Nest, Hive, Water logging vegitation etc)', 
      'Hold by Bharti', 
      'Jumper Mismatch', 
      'H/W Faulty', 
      'GSM Issue', 
      'WIP', 
      'To Start', 
      'MCB Issue', 
      'Water Logging Issue', 
      'Theft Issue', 
      'RMO / SRN', 
      'Planning Change', 
      'Access Approval Awaited', 
      'Weekend Access Only', 
      'Additional material required', 
      'Completed with Alarm', 
      'Media Issue', 
      'Team not Available',
      'ASP drop'
    ]
  },
  integration: {
    validStatuses: [
      'Integration Done with Alarm',
      'Integration Done',
      'Integration Not Done',
      
    ],
    validRemarks: [
      'Media Issue', 
      'HW Faulty', 
      'Script NA', 
      'Fme NA', 
      'SACFA Pending', 
      'Power issue', 
      'LAC Issue', 
      'Access/owner/Community Issue', 
      'WIP', 
      'Infra issue', 
      'Hold By Customer', 
      'RMO', 
      'LKF Pending', 
      'Media Pending', 
      'J2 pending', 
      'Integration Completed'
    ]
  },
  rfaiSurvey: {
    validStatuses: [
      'RFAI Survey Done',
      'Survey Fail-access',
      'Survey Fail-infra',
      'Survey Planned',
      'Survey Not Planned-Team Consumed',
      'Survey Not Planned-High RFAI',
      'Survey Pending-Team Drop',
      'Survey Pending-Access Issue',
      'Survey Pending-Weekend access'
      
    ]
  ,
    validRemarks: [
      'Environmental Issue(Nest, Hive, Water logging vegitation etc)', 
      'Access/owner/Community Issue', 
      'Pole Mount height diffrence Issue', 
      'Weekend Issue', 
      'Power Issue', 
      'Infra Issue', 
      'Survey To Plan', 
      'OK for MO', 
      'Pole Mount NA', 
      'Mcb issue', 
      'Mcb and Pole Mount NA', 
      'OHS Issue', 
      'HCT Tray Issue', 
      'OD Bed/Pole NA', 
      'Others', 
      'J2 pending', 
      'Boundary Wall', 
      'EB Issue', 
      'PoP not ready', 
      'LoS Issue', 
      'Battery Bank NA', 
      'Nominal Hold', 
      'RFAI Received', 
      'RFAI Accepted', 
      'RFAI Rejected', 
      'CF-RFAI Accepted'
    ]
  },
  moPunching: {
    validStatuses: [
      'MO Dispatch Done',
      'MO Done',
      'MO Not Done',
      'MO Dispatch Hold'
    ],
    
    validRemarks: [
      'Mo to Raise', 
      'On Hold stock issue',
      'On Hold BOQ', 
      'Short Material', 
      'Cancelled IM', 
      'Cancelled WH', 
      'On Hold By customer', 
      'Planning issue', 
      'Others', 
      'Oracle Issue/WH closed', 
      'Hold by WH', 
      'Nominal Hold', 
      'Vehicle NA', 
      'To Dispatch', 
      'Material On Hold Prestaging', 
      'On Hold Vehicle Issue', 
      'On Hold WH Issue', 
      'On Hold By Bharti', 
      'On Hold Access Issue', 
      'In Transit', 
      'Access/owner/Community Issue', 
      'RMO', 
      'Material Incorrect Delivery', 
      'Partial material delivered', 
      'Material Delivered at wrong location', 
      'Vehicle breakdown'
    ]
  },
  // New POBO team
  pobo: {
    validStatuses: [
      'RFAI Accepted for Survey',
      'Planning input incorrect',
      'Rfai Hold',
      'Descope'
    ],
    validRemarks: [
      'RFAI Accepted for Survey',
      'Planning input incorrect',
      'Rfai Hold',
      'Descope'
    ]
  },
  // New Material Delivery team
  materialDelivery: {
    validStatuses: [
      'Material In Transit',
      'Material Delivery Done',
      'Material Returned'
    ],
    validRemarks: [
      'In Transit',
      'Access/owner/Community Issue',
      'RMO',
      'Material Incorrect Delivery',
      'Partial material delivered',
      'Material Delivered at wrong location',
      'Vehicle breakdown',
      'Material on site'
    ]
  },
  // New PRI team
  pri: {
    validStatuses: [
      'PRI Work in Progress',
      'PRI Done',
      'PRI Not Done',
      'PRI Status Not Available'
    ],
    validRemarks: [
      'Environmental Issue(Nest, Hive, Water logging vegitation etc)',
      'Access/owner/Community Issue',
      'Pole Mount height diffrence Issue',
      'Weekend Issue',
      'Power Issue',
      'Infra Issue',
      'Mcb issue',
      'Mcb and Pole Mount NA',
      'Pole Mount NA',
      'HCT Tray Issue',
      'OD Bed/Pole NA',
      'Boundary Wall',
      'EB Issue',
      'On Hold',
      'Access Issue',
      'To be Survey',
      'To be Mo Punch',
      'To be Dispatch',
      'To be Delivered',
      'To be Install',
      'To be integration'
    ]
  }
};

// Common circles for all teams
const validCircles = [
  'Raj', 
  'Delhi', 
  'Nepal', 
  'AP', 
  'Assam',
  'Chennai',
  'Haryana', 
  'HP',
  'Karnatka',
  'ROTN', 
  'UPW',
  'J&K'
];

// Template generation endpoint
app.get('/api/generate-template/:team', async (req, res) => {
  const team = req.params.team;
  const teamConfig = teamConfigs[team];
  
  if (!teamConfig) {
    return res.status(400).json({ error: 'Invalid team' });
  }
  
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Create a hidden sheet for validation lists
    const validationSheet = workbook.addWorksheet('ValidLists');
    validationSheet.state = 'hidden'; // Hide this sheet
    
    // Add status values to column A
    validationSheet.getCell('A1').value = 'Status Values';
    validationSheet.getCell('A1').font = { bold: true };
    
    teamConfig.validStatuses.forEach((status, index) => {
      validationSheet.getCell(`A${index + 2}`).value = status;
    });
    
    // Add remarks values to column B
    validationSheet.getCell('B1').value = 'Remarks Values';
    validationSheet.getCell('B1').font = { bold: true };
    
    teamConfig.validRemarks.forEach((remark, index) => {
      validationSheet.getCell(`B${index + 2}`).value = remark;
    });
    
    // Add circles values to column C
    validationSheet.getCell('C1').value = 'Circle Values';
    validationSheet.getCell('C1').font = { bold: true };
    
    validCircles.forEach((circle, index) => {
      validationSheet.getCell(`C${index + 2}`).value = circle;
    });
    
    // Add data worksheet
    const dataSheet = workbook.addWorksheet('Data');
    
    // Define columns with headers
    dataSheet.columns = [
      { header: 'Activity Date', width: 15 },
      { header: 'Activity Status', width: 30 },
      { header: 'Unique ID', width: 20 },
      { header: 'Circle', width: 15 },
      { header: 'Remarks', width: 40 }
    ];
    
    // Style headers
    dataSheet.getRow(1).font = { bold: true };
    dataSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // Light gray
    };
    
    // Add data validation for Status column using the validation sheet reference
    const statusLastRow = teamConfig.validStatuses.length + 1;
    for (let i = 2; i <= 100; i++) {
      dataSheet.getCell(`B${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`ValidLists!$A$2:$A$${statusLastRow}`]
      };
    }
    
    // Add data validation for Circle column using the validation sheet reference
    const circleLastRow = validCircles.length + 1;
    for (let i = 2; i <= 100; i++) {
      dataSheet.getCell(`D${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`ValidLists!$C$2:$C$${circleLastRow}`]
      };
    }
    
    // Add data validation for Remarks column using the validation sheet reference
    const remarksLastRow = teamConfig.validRemarks.length + 1;
    for (let i = 2; i <= 100; i++) {
      dataSheet.getCell(`E${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`ValidLists!$B$2:$B$${remarksLastRow}`]
      };
    }
    
    // Add sample rows
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    for (let i = 0; i < 20; i++) {
      dataSheet.addRow([today, '', '', '', '']);
    }
    
    // Format date cells
    for (let i = 2; i <= 21; i++) {
      const dateCell = dataSheet.getCell(`A${i}`);
      dateCell.numFmt = 'yyyy-mm-dd';
    }
    
    // Set the active sheet to Data
    workbook.views = [
      {
        firstSheet: 1, // Index 1 is the Data sheet (ValidLists is 0, Data is 1)
        activeTab: 1,
        visibility: 'visible'
      }
    ];
    
    // Set content type and send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${team}_template.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});