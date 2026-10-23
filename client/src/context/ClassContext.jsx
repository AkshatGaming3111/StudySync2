import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ClassContext = createContext();

export function ClassProvider({ children }) {
  const { currentUser, isTeacher, isStudent } = useAuth();
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [activeClassData, setActiveClassData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await api.classes.getAll({
        userId: currentUser.id,
        role: currentUser.role
      });
      if (res.success && res.classes) {
        setClasses(res.classes);
        // If no active class or current active class not in list, select first
        if (!activeClass && res.classes.length > 0) {
          selectClass(res.classes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [currentUser]);

  const selectClass = async (classItem) => {
    if (!classItem) {
      setActiveClass(null);
      setActiveClassData(null);
      return;
    }
    setActiveClass(classItem);
    try {
      const res = await api.classes.getById(classItem.id);
      if (res.success) {
        setActiveClassData(res);
      }
    } catch (err) {
      console.error('Failed to load active class details:', err);
    }
  };

  const selectClassById = async (classId) => {
    if (!classId) return;
    if (activeClass?.id === classId && activeClassData) return activeClass;
    const existing = classes.find(c => c.id === classId);
    if (existing) {
      setActiveClass(existing);
    }
    try {
      const res = await api.classes.getById(classId);
      if (res.success && res.class) {
        setActiveClass(res.class);
        setActiveClassData(res);
        return res.class;
      }
    } catch (err) {
      console.error('Failed to select class by ID:', err);
    }
  };

  const refreshActiveClass = async () => {
    if (!activeClass) return;
    try {
      const res = await api.classes.getById(activeClass.id);
      if (res.success) {
        setActiveClassData(res);
        setActiveClass(res.class);
      }
    } catch (err) {
      console.error('Failed to refresh active class:', err);
    }
  };

  const createClass = async (classData) => {
    const res = await api.classes.create({
      ...classData,
      teacherId: currentUser.id
    });
    if (res.success && res.class) {
      await fetchClasses();
      selectClass(res.class);
      return res.class;
    }
    throw new Error(res.error || 'Failed to create class');
  };

  const joinClass = async (code) => {
    const res = await api.classes.join(code, currentUser.id);
    if (res.success && res.class) {
      await fetchClasses();
      selectClass(res.class);
      return res;
    }
    throw new Error(res.error || 'Failed to join class');
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        activeClass,
        activeClassData,
        loading,
        selectClass,
        selectClassById,
        refreshActiveClass,
        createClass,
        joinClass,
        fetchClasses
      }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export const useClass = () => useContext(ClassContext);
