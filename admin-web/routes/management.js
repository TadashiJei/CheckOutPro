const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const roleController = require('../controllers/roleController');
const employeeController = require('../controllers/employeeController');
const scheduleController = require('../controllers/scheduleController');
const positionController = require('../controllers/positionController');
const performanceController = require('../controllers/performanceController');
const inventoryAssignmentController = require('../controllers/inventoryAssignmentController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all management routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Role management routes
router.get('/roles', roleController.getRoles);
router.get('/roles/create', roleController.getCreateRole);
router.post('/roles/create', roleController.postCreateRole);
router.get('/roles/:id/edit', roleController.getEditRole);
router.post('/roles/:id/edit', roleController.postUpdateRole);
router.delete('/roles/:id', roleController.deleteRole);

// Employee management routes
router.get('/employees', employeeController.getEmployees);
router.get('/employees/create', employeeController.getCreateEmployee);
router.post('/employees/create', employeeController.postCreateEmployee);
router.get('/employees/:id/edit', employeeController.getEditEmployee);
router.post('/employees/:id/edit', employeeController.postUpdateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.get('/employees/:id/orders', employeeController.getEmployeeOrders);

// Biometric routes
router.get('/employees/:id/biometric', employeeController.getBiometricEnrollment);
router.post('/employees/:id/biometric', employeeController.postBiometricEnrollment);

// Schedule management routes
router.get('/schedule', scheduleController.getScheduleCalendar);
router.get('/schedule/data', scheduleController.getScheduleData);
router.post('/schedule', scheduleController.createSchedule);
router.put('/schedule/:id', scheduleController.updateSchedule);
router.delete('/schedule/:id', scheduleController.deleteSchedule);
router.get('/employees/:id/hours', scheduleController.getHoursReport);
router.get('/employees/:id/hours/export', scheduleController.exportHoursReport);

// Performance management routes
router.get('/performance', performanceController.getPerformanceDashboard);
router.get('/employees/:id/performance', performanceController.getEmployeePerformance);
router.get('/employees/:id/performance/data', performanceController.getPerformanceData);
router.get('/employees/:id/performance/export', performanceController.exportPerformanceReport);
router.get('/employees/:id/goals', performanceController.getPerformanceGoals);
router.post('/employees/:id/goals', performanceController.createPerformanceGoal);
router.post('/employees/:id/goals/:goalId', performanceController.updatePerformanceGoal);
router.delete('/employees/:id/goals/:goalId', performanceController.deletePerformanceGoal);

// Inventory assignment routes
router.get('/inventory-assignments', inventoryAssignmentController.getInventoryAssignments);
router.get('/inventory-assignments/create', inventoryAssignmentController.getCreateAssignment);
router.post('/inventory-assignments/create', inventoryAssignmentController.postCreateAssignment);
router.get('/inventory-assignments/:id/edit', inventoryAssignmentController.getEditAssignment);
router.post('/inventory-assignments/:id/edit', inventoryAssignmentController.postUpdateAssignment);
router.delete('/inventory-assignments/:id', inventoryAssignmentController.deleteAssignment);
router.get('/employees/:id/inventory', inventoryAssignmentController.getEmployeeAssignments);
// This route was incorrectly defined - it needs an employee ID
// router.get('/inventory-performance', inventoryAssignmentController.getInventoryPerformance);

// Employee position assignments and biometric management routes
router.get('/employee-assignments', positionController.getEmployeeAssignments);
router.post('/employees/assign-position', positionController.assignPosition);
router.post('/employees/bulk-assign', positionController.bulkAssignPositions);
router.get('/employees/:id/assignment-history', positionController.getAssignmentHistory);
router.get('/employees/assignment-template', positionController.getAssignmentTemplate);
router.post('/employees/import-assignments', upload.single('csv_file'), positionController.importAssignments);
router.post('/employees/:id/inventory/count', inventoryAssignmentController.postInventoryCount);
router.get('/employees/:id/inventory/performance', inventoryAssignmentController.getInventoryPerformance);
router.get('/employees/:id/inventory/performance/export', inventoryAssignmentController.exportInventoryPerformance);

module.exports = router;
