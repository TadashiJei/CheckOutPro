const Role = require('../models/Role');

/**
 * Role Controller
 * Handles role management operations
 */
const roleController = {
  /**
   * Render roles list page
   */
  getRoles: async (req, res) => {
    try {
      const roles = await Role.getAll();
      
      res.render('pages/management/roles', {
        title: 'Role Management',
        roles,
        path: '/management/roles'
      });
    } catch (error) {
      console.error('Error getting roles:', error);
      req.flash('error', 'Failed to load roles');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render role creation form
   */
  getCreateRole: (req, res) => {
    res.render('pages/management/role-form', {
      title: 'Create Role',
      role: {},
      isEdit: false,
      path: '/management/roles/create'
    });
  },
  
  /**
   * Process role creation
   */
  postCreateRole: async (req, res) => {
    try {
      const { name, description, permissions } = req.body;
      
      // Validate input
      if (!name) {
        req.flash('error', 'Role name is required');
        return res.redirect('/management/roles/create');
      }
      
      // Parse permissions
      let parsedPermissions = {};
      if (permissions) {
        if (typeof permissions === 'string') {
          parsedPermissions = JSON.parse(permissions);
        } else {
          parsedPermissions = permissions;
        }
      }
      
      // Create role
      await Role.create({
        name,
        description,
        permissions: parsedPermissions
      });
      
      req.flash('success_msg', 'Role created successfully');
      res.redirect('/management/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      req.flash('error', 'Failed to create role');
      res.redirect('/management/roles/create');
    }
  },
  
  /**
   * Render role edit form
   */
  getEditRole: async (req, res) => {
    try {
      const { id } = req.params;
      const role = await Role.getById(id);
      
      if (!role) {
        req.flash('error', 'Role not found');
        return res.redirect('/management/roles');
      }
      
      res.render('pages/management/role-form', {
        title: 'Edit Role',
        role,
        isEdit: true,
        path: `/management/roles/${id}/edit`
      });
    } catch (error) {
      console.error('Error getting role:', error);
      req.flash('error', 'Failed to load role');
      res.redirect('/management/roles');
    }
  },
  
  /**
   * Process role update
   */
  postUpdateRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, permissions } = req.body;
      
      // Validate input
      if (!name) {
        req.flash('error', 'Role name is required');
        return res.redirect(`/management/roles/${id}/edit`);
      }
      
      // Parse permissions
      let parsedPermissions = {};
      if (permissions) {
        if (typeof permissions === 'string') {
          parsedPermissions = JSON.parse(permissions);
        } else {
          parsedPermissions = permissions;
        }
      }
      
      // Update role
      await Role.update(id, {
        name,
        description,
        permissions: parsedPermissions
      });
      
      req.flash('success_msg', 'Role updated successfully');
      res.redirect('/management/roles');
    } catch (error) {
      console.error('Error updating role:', error);
      req.flash('error', 'Failed to update role');
      res.redirect(`/management/roles/${req.params.id}/edit`);
    }
  },
  
  /**
   * Delete role
   */
  deleteRole: async (req, res) => {
    try {
      const { id } = req.params;
      
      await Role.delete(id);
      
      req.flash('success_msg', 'Role deleted successfully');
      res.redirect('/management/roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      req.flash('error', 'Failed to delete role');
      res.redirect('/management/roles');
    }
  }
};

module.exports = roleController;
