let assets = [];
let editingAssetId = null;
let currentDetailAsset = null;


function updateStats() {
    const totalAssets = assets.length;
    const lentOutAssets = assets.filter(a => a.status === 'Lent Out').length;

    document.getElementById('totalAssets').textContent = totalAssets;
    document.getElementById('activeAssets').textContent = lentOutAssets;
  
}

function renderAssetsTable() {
    const tbody = document.getElementById('assetsTableBody');

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm) ||
            (asset.lentTo && asset.lentTo.toLowerCase().includes(searchTerm)) ||
            (asset.location && asset.location.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || asset.category === categoryFilter;
        const matchesStatus = !statusFilter || asset.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    tbody.innerHTML = filteredAssets.map(asset => `
        <tr>
            <td>
                <div>
                    <div style="font-weight: 500;">${asset.name}</div>
                </div>
            </td>
            <td>
                <span class="badge badge-blue">${asset.category}</span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span>
            </td>
            <td>${asset.location || 'N/A'}</td>
            <td>${asset.lentTo || 'Unassigned'}</td>
            <td>${asset.lendDate || 'N/A'}</td>
            <td>$${(asset.value || 0).toLocaleString()}</td>
            <td>
                <div class="actions">
                    <button class="action-btn" onclick="viewAsset(${asset.id})" title="View">👁️</button>
                    <button class="action-btn" onclick="editAsset(${asset.id})" title="Edit">✏️</button>
                    <button class="btn-danger" onclick="deleteAsset(${asset.id})" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Available': return 'badge-green';
        case 'Lent Out': return 'badge-yellow';
        case 'Under Maintenance': return 'badge-purple';
        case 'Lost/Stolen': return 'badge-red';
        default: return 'badge-gray';
    }
}

function updateDisplay() {
    updateStats();
    renderAssetsTable();
}

function filterAssets() {
    renderAssetsTable();
}

function openAddModal() {
    editingAssetId = null;
    document.getElementById('modalTitle').textContent = 'Add New IT Asset';
    clearForm();
    document.getElementById('assetModal').classList.add('active');
}

function editAsset(id) {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    editingAssetId = id;
    document.getElementById('modalTitle').textContent = 'Edit IT Asset';

    document.getElementById('assetName').value = asset.name || '';
    document.getElementById('assetCategory').value = asset.category || '';
    document.getElementById('assetStatus').value = asset.status || 'Available';
    document.getElementById('location').value = asset.location || '';
    document.getElementById('lentTo').value = asset.lentTo || '';
    document.getElementById('lendDate').value = asset.lendDate || '';
    document.getElementById('description').value = asset.description || '';
    document.getElementById('value').value = asset.value || '';

    document.getElementById('assetModal').classList.add('active');
}

function viewAsset(id) {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    currentDetailAsset = asset;
    const detailsHTML = `
        <div class="form-grid">
            <div><strong>Asset Name:</strong> ${asset.name}</div>
            <div><strong>Category:</strong> <span class="badge badge-blue">${asset.category}</span></div>
            <div><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span></div>
            <div><strong>Location:</strong> ${asset.location || 'N/A'}</div>
            <div><strong>Lent To:</strong> ${asset.lentTo || 'Unassigned'}</div>
            <div><strong>Lend Date:</strong> ${asset.lendDate || 'N/A'}</div>
        ${asset.description ? `<div style="margin-top: 1rem;"><strong>Description:</strong><br><div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${asset.description}</div></div>` : ''}
    `;

    document.getElementById('assetDetails').innerHTML = detailsHTML;
    document.getElementById('detailModal').classList.add('active');
}

function editFromDetail() {
    closeDetailModal();
    editAsset(currentDetailAsset.id);
}

function deleteAsset(id) {
    if (confirm('Are you sure you want to delete this asset?')) {
        assets = assets.filter(a => a.id !== id);
        updateDisplay();
    }
}

function saveAsset() {
    const name = document.getElementById('assetName').value;
    const category = document.getElementById('assetCategory').value;

    if (!name || !category) {
        alert('Please fill in required fields (Asset Name and Category)');
        return;
    }

    const assetData = {
        name,
        category,
        status: document.getElementById('assetStatus').value,
        location: document.getElementById('location').value,
        lentTo: document.getElementById('lentTo').value,
        lendDate: document.getElementById('lendDate').value,
        description: document.getElementById('description').value,
        value: parseFloat(document.getElementById('value')?.value) || 0
    };

    if (editingAssetId) {
        const index = assets.findIndex(a => a.id === editingAssetId);
        if (index !== -1) {
            assets[index] = { ...assetData, id: editingAssetId };
        }
    } else {
        assetData.id = Date.now();
        assets.push(assetData);
    }

    closeModal();
    updateDisplay();
}

function clearForm() {
    document.getElementById('assetName').value = '';
    document.getElementById('assetCategory').value = '';
    document.getElementById('assetStatus').value = 'Available';
    document.getElementById('location').value = '';
    document.getElementById('lentTo').value = '';
    document.getElementById('lendDate').value = '';
    document.getElementById('description').value = '';
    if (document.getElementById('value')) {
        document.getElementById('value').value = '';
    }
}

function closeModal() {
    document.getElementById('assetModal').classList.remove('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

function exportCSV() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm) ||
            (asset.lentTo && asset.lentTo.toLowerCase().includes(searchTerm)) ||
            (asset.location && asset.location.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || asset.category === categoryFilter;
        const matchesStatus = !statusFilter || asset.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const headers = ['Name', 'Category', 'Status', 'Location', 'Lent To', 'Lend Date', 'Description'];
    const csvData = [
        headers.join(','),
        ...filteredAssets.map(asset => [
            asset.name,
            asset.category,
            asset.status,
            asset.location,
            asset.lentTo,
            asset.lendDate,
            asset.value,
            `"${asset.description.replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('assetModal');
    const detailModal = document.getElementById('detailModal');

    if (e.target === modal) {
        closeModal();
    }
    if (e.target === detailModal) {
        closeDetailModal();
    }
});

// Initialize data on page load
window.addEventListener('DOMContentLoaded', initializeData);