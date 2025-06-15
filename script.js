// Sample data
let staffData = [
    {
        id: "EMP1001",
        fullName: "John Smith",
        position: "HR Manager",
        department: "HR",
        joinDate: "2020-05-15",
        status: "Active",
        movementDate: "",
        movementType: "",
        replacementId: "",
        notes: ""
    },
    {
        id: "EMP1002",
        fullName: "Sarah Johnson",
        position: "IT Specialist",
        department: "IT",
        joinDate: "2021-02-10",
        status: "Resigned",
        movementDate: "2023-06-01",
        movementType: "Resignation",
        replacementId: "EMP1005",
        notes: "Personal reasons"
    },
    {
        id: "EMP1003",
        fullName: "Michael Brown",
        position: "Accountant",
        department: "Finance",
        joinDate: "2019-11-20",
        status: "Terminated",
        movementDate: "2023-03-15",
        movementType: "Termination",
        replacementId: "",
        notes: "Performance issues"
    },
    {
        id: "EMP1004",
        fullName: "Emily Davis",
        position: "Operations Lead",
        department: "Operations",
        joinDate: "2022-01-05",
        status: "Active",
        movementDate: "",
        movementType: "",
        replacementId: "",
        notes: ""
    },
    {
        id: "EMP1005",
        fullName: "Robert Wilson",
        position: "IT Specialist",
        department: "IT",
        joinDate: "2023-06-10",
        status: "Replacement",
        movementDate: "2023-06-10",
        movementType: "Replacement",
        replacementId: "EMP1002",
        notes: "Replaced Sarah Johnson"
    }
];

// DOM elements
const staffTableBody = document.getElementById('staffTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const departmentFilter = document.getElementById('departmentFilter');
const staffForm = document.getElementById('staffForm');
const staffModal = new bootstrap.Modal(document.getElementById('staffModal'));
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const saveStaffBtn = document.getElementById('saveStaffBtn');
const confirmActionBtn = document.getElementById('confirmActionBtn');
const exportBtn = document.getElementById('exportBtn');
const addStaffBtn = document.getElementById('addStaffBtn');

// Current action and selected staff ID
let currentAction = '';
let selectedStaffId = '';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderStaffTable(staffData);
    
    // Event listeners
    searchInput.addEventListener('input', filterStaff);
    statusFilter.addEventListener('change', filterStaff);
    departmentFilter.addEventListener('change', filterStaff);
    saveStaffBtn.addEventListener('click', saveStaff);
    confirmActionBtn.addEventListener('click', executeAction);
    exportBtn.addEventListener('click', exportToExcel);
    addStaffBtn.addEventListener('click', prepareAddStaff);
    
    // Show/hide movement fields based on status
    document.getElementById('status').addEventListener('change', function() {
        toggleMovementFields(this.value);
    });
});

// Render staff table
function renderStaffTable(data) {
    staffTableBody.innerHTML = '';
    
    if (data.length === 0) {
        staffTableBody.innerHTML = '<tr><td colspan="10" class="text-center">No staff records found</td></tr>';
        return;
    }
    
    data.forEach(staff => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staff.id}</td>
            <td>${staff.fullName}</td>
            <td>${staff.position}</td>
            <td>${staff.department}</td>
            <td>${formatDate(staff.joinDate)}</td>
            <td><span class="status-badge ${getStatusClass(staff.status)}">${staff.status}</span></td>
            <td>${staff.movementDate ? formatDate(staff.movementDate) : '-'}</td>
            <td>${staff.movementType || '-'}</td>
            <td>${staff.replacementId || '-'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-warning edit-btn" data-id="${staff.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${staff.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        staffTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            prepareEditStaff(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            prepareDeleteStaff(this.getAttribute('data-id'));
        });
    });
}

// Filter staff based on search and filters
function filterStaff() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const departmentValue = departmentFilter.value;
    
    const filteredData = staffData.filter(staff => {
        const matchesSearch = 
            staff.id.toLowerCase().includes(searchTerm) ||
            staff.fullName.toLowerCase().includes(searchTerm) ||
            staff.position.toLowerCase().includes(searchTerm) ||
            staff.department.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusValue ? staff.status === statusValue : true;
        const matchesDepartment = departmentValue ? staff.department === departmentValue : true;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    renderStaffTable(filteredData);
    
    // Highlight search terms in the table
    if (searchTerm) {
        highlightSearchTerms(searchTerm);
    }
}

// Highlight search terms in the table
function highlightSearchTerms(term) {
    const rows = staffTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td:not(:last-child)');
        let rowMatches = false;
        
        cells.forEach(cell => {
            const text = cell.textContent.toLowerCase();
            if (text.includes(term)) {
                rowMatches = true;
                const regex = new RegExp(term, 'gi');
                cell.innerHTML = cell.textContent.replace(regex, match => `<span class="highlight">${match}</span>`);
            }
        });
        
        if (rowMatches) {
            row.classList.add('highlight');
        } else {
            row.classList.remove('highlight');
        }
    });
}

// Prepare to add new staff
function prepareAddStaff() {
    currentAction = 'add';
    document.getElementById('staffModalLabel').textContent = 'Add New Staff';
    staffForm.reset();
    document.getElementById('staffId').value = '';
    document.getElementById('staffIdInput').value = generateStaffId();
    document.getElementById('status').value = 'Active';
    toggleMovementFields('Active');
    staffModal.show();
}

// Prepare to edit staff
function prepareEditStaff(id) {
    currentAction = 'edit';
    selectedStaffId = id;
    const staff = staffData.find(s => s.id === id);
    
    if (staff) {
        document.getElementById('staffModalLabel').textContent = 'Edit Staff Record';
        document.getElementById('staffId').value = staff.id;
        document.getElementById('staffIdInput').value = staff.id;
        document.getElementById('fullName').value = staff.fullName;
        document.getElementById('position').value = staff.position;
        document.getElementById('department').value = staff.department;
        document.getElementById('joinDate').value = staff.joinDate;
        document.getElementById('status').value = staff.status;
        document.getElementById('movementDate').value = staff.movementDate || '';
        document.getElementById('movementType').value = staff.movementType || '';
        document.getElementById('replacementId').value = staff.replacementId || '';
        document.getElementById('notes').value = staff.notes || '';
        
        toggleMovementFields(staff.status);
        staffModal.show();
    }
}

// Prepare to delete staff
function prepareDeleteStaff(id) {
    currentAction = 'delete';
    selectedStaffId = id;
    const staff = staffData.find(s => s.id === id);
    
    if (staff) {
        document.getElementById('confirmModalBody').innerHTML = `
            Are you sure you want to delete the staff record for <strong>${staff.fullName} (${staff.id})</strong>?
            <div class="alert alert-danger mt-2">
                <i class="fas fa-exclamation-triangle me-2"></i>
                This action cannot be undone!
            </div>
        `;
        confirmModal.show();
    }
}

// Save staff (add or edit)
function saveStaff() {
    if (!staffForm.checkValidity()) {
        staffForm.reportValidity();
        return;
    }
    
    const staffIdInput = document.getElementById('staffIdInput').value.trim();
    
    // Check for duplicate ID when adding new staff
    if (currentAction === 'add' && staffData.some(s => s.id === staffIdInput)) {
        alert('Staff ID already exists. Please use a unique ID.');
        return;
    }
    
    const staff = {
        id: staffIdInput,
        fullName: document.getElementById('fullName').value,
        position: document.getElementById('position').value,
        department: document.getElementById('department').value,
        joinDate: document.getElementById('joinDate').value,
        status: document.getElementById('status').value,
        movementDate: document.getElementById('movementDate').value || '',
        movementType: document.getElementById('movementType').value || '',
        replacementId: document.getElementById('replacementId').value || '',
        notes: document.getElementById('notes').value || ''
    };
    
    if (currentAction === 'add') {
        staffData.push(staff);
    } else if (currentAction === 'edit') {
        const index = staffData.findIndex(s => s.id === selectedStaffId);
        if (index !== -1) {
            staffData[index] = staff;
        }
    }
    
    renderStaffTable(staffData);
    staffModal.hide();
    filterStaff();
}

// Execute action (delete)
function executeAction() {
    if (currentAction === 'delete') {
        staffData = staffData.filter(staff => staff.id !== selectedStaffId);
        renderStaffTable(staffData);
        filterStaff();
    }
    
    confirmModal.hide();
}

// Export to Excel
function exportToExcel() {
    const dataToExport = staffData.map(staff => ({
        'ID': staff.id,
        'Full Name': staff.fullName,
        'Position': staff.position,
        'Department': staff.department,
        'Join Date': formatDate(staff.joinDate),
        'Status': staff.status,
        'Movement Date': staff.movementDate ? formatDate(staff.movementDate) : '',
        'Movement Type': staff.movementType || '',
        'Replacement ID': staff.replacementId || '',
        'Notes': staff.notes || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Movement');
    XLSX.writeFile(workbook, 'Staff_Movement_Report.xlsx');
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusClass(status) {
    switch (status) {
        case 'Active': return 'active';
        case 'Resigned': return 'resigned';
        case 'Terminated': return 'terminated';
        case 'Replacement': return 'replacement';
        default: return '';
    }
}

function generateStaffId() {
    const lastId = staffData.length > 0 ? 
        parseInt(staffData[staffData.length - 1].id.replace('EMP', '')) : 1000;
    return 'EMP' + (lastId + 1);
}

function toggleMovementFields(status) {
    const movementDateGroup = document.getElementById('movementDateGroup');
    const movementTypeGroup = document.getElementById('movementTypeGroup');
    const replacementGroup = document.getElementById('replacementGroup');
    
    if (status === 'Active') {
        movementDateGroup.style.display = 'none';
        movementTypeGroup.style.display = 'none';
        replacementGroup.style.display = 'none';
    } else {
        movementDateGroup.style.display = 'block';
        movementTypeGroup.style.display = 'block';
        
        if (status === 'Replacement') {
            replacementGroup.style.display = 'block';
        } else {
            replacementGroup.style.display = 'none';
        }
    }
}