import { extractCodeContext } from '../utils/contextAnalysis';

const testCode = `import React, { useState, useEffect } from 'react';
import axios from 'axios';

class UserManager {
  constructor() {
    this.users = [];
    this.apiUrl = 'https://api.example.com';
  }

  async fetchUsers() {
    try {
      const response = await axios.get(\`\${this.apiUrl}/users\`);
      this.users = response.data;
      return this.users;
    } catch (error) {
      console.log('Error fetching users:', error);
      throw error;
    }
  }

  findUserById(id) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        return this.users[i];
      }
    }
    return null;
  }

  addUser(user) {
    this.users.push(user);
    console.log('User added:', user);
  }
}

const UserComponent = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const manager = new UserManager();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userData = await manager.fetchUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>User List</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserComponent;`;

test('Context analysis extracts code information correctly', () => {
  const context = extractCodeContext(testCode, 'javascript');

  console.log('Context Analysis Result:');
  console.log(JSON.stringify(context, null, 2));

  // Test basic structure
  expect(context.language).toBe('javascript');
  expect(context.functions.length).toBeGreaterThan(0);
  expect(context.classes.length).toBeGreaterThan(0);
  expect(context.imports.length).toBeGreaterThan(0);
  expect(context.patterns.length).toBeGreaterThan(0);
  expect(context.codeStructure).toBeTruthy();

  // Test specific extractions
  expect(context.classes).toContain('UserManager');
  expect(context.functions).toContain('fetchUsers');
  expect(context.functions).toContain('findUserById');
  expect(context.functions).toContain('addUser');
  expect(context.functions).toContain('UserComponent');
  expect(context.functions).toContain('loadUsers');
  expect(context.imports).toContain('react');
  expect(context.imports).toContain('axios');
  expect(context.patterns).toContain('async/await pattern');
  expect(context.patterns).toContain('ES6 classes');
  expect(context.patterns).toContain('modern variable declarations');
  expect(context.patterns).toContain('ES6 modules');
});
