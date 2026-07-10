// Mock employee directory — replace with real API/DB later
export const EMPLOYEES = [
  { id: 1,  name: "Maria Santos",       department: "Administration",         departmentId: "ADMIN", email: "m.santos@rmbgh.com",    avatar: "MS" },
  { id: 2,  name: "Carlo Dimaculangan", department: "Safety Office",          departmentId: "ADMIN", email: "c.dima@rmbgh.com",      avatar: "CD" },
  { id: 3,  name: "Ransh Dy",           department: "Information Technology", departmentId: "IT",    email: "r.dy@rmbgh.com",        avatar: "RD" },
  { id: 4,  name: "Mark Reyes",         department: "Information Technology", departmentId: "IT",    email: "m.reyes@rmbgh.com",     avatar: "MR" },
  { id: 5,  name: "Ana Cruz",           department: "Human Resources",        departmentId: "HR",    email: "a.cruz@rmbgh.com",      avatar: "AC" },
  { id: 6,  name: "Jose Mendoza",       department: "Human Resources",        departmentId: "HR",    email: "j.mendoza@rmbgh.com",   avatar: "JM" },
  { id: 7,  name: "Liza Tan",           department: "Laboratory",             departmentId: "LAB",   email: "l.tan@rmbgh.com",       avatar: "LT" },
  { id: 8,  name: "Rico Bautista",      department: "Laboratory",             departmentId: "LAB",   email: "r.bautista@rmbgh.com",  avatar: "RB" },
  { id: 9,  name: "Nina Flores",        department: "Finance",                departmentId: "FIN",   email: "n.flores@rmbgh.com",    avatar: "NF" },
  { id: 10, name: "Eddie Lim",          department: "Finance",                departmentId: "FIN",   email: "e.lim@rmbgh.com",       avatar: "EL" },
  { id: 11, name: "Grace Villanueva",   department: "Nursing",                departmentId: "NUR",   email: "g.villanueva@rmbgh.com",avatar: "GV" },
  { id: 12, name: "Ben Aquino",         department: "Nursing",                departmentId: "NUR",   email: "b.aquino@rmbgh.com",    avatar: "BA" },
];

// Group employees by department for directory view
export const DEPARTMENTS_MAP = EMPLOYEES.reduce((acc, emp) => {
  if (!acc[emp.departmentId]) {
    acc[emp.departmentId] = { label: emp.department, employees: [] };
  }
  acc[emp.departmentId].employees.push(emp);
  return acc;
}, {});