
import { useEffect, useState } from 'react'
import './App.css'

const sampleDonors = [
  {
    donorId: 'D001',
    name: 'Arun Kumar',
    age: 22,
    bloodGroup: 'O+',
    contactNumber: '9876543210',
    address: 'Coimbatore',
    availability: 'Available',
  },
  {
    donorId: 'D002',
    name: 'Priya Sharma',
    age: 24,
    bloodGroup: 'A+',
    contactNumber: '9876543211',
    address: 'Peelamedu, Coimbatore',
    availability: 'Available',
  },
  {
    donorId: 'D003',
    name: 'Rahul Nair',
    age: 21,
    bloodGroup: 'B+',
    contactNumber: '9876543212',
    address: 'Gandhipuram, Coimbatore',
    availability: 'Unavailable',
  },
  {
    donorId: 'D004',
    name: 'Sneha Raj',
    age: 23,
    bloodGroup: 'AB+',
    contactNumber: '9876543213',
    address: 'RS Puram, Coimbatore',
    availability: 'Available',
  },
]

const emptyDonor = {
  donorId: '',
  name: '',
  age: '',
  bloodGroup: '',
  contactNumber: '',
  address: '',
  availability: 'Available',
}

const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]

function App() {
  const [donors, setDonors] = useState(() => {
    try {
      const savedDonors = localStorage.getItem('bloodlink-donors')
      return savedDonors === null
        ? sampleDonors
        : JSON.parse(savedDonors)
    } catch {
      return sampleDonors
    }
  })

  const [search, setSearch] = useState('')
  const [bloodFilter, setBloodFilter] = useState('All')
  const [editingDonor, setEditingDonor] = useState(null)
  const [formData, setFormData] = useState(emptyDonor)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    localStorage.setItem('bloodlink-donors', JSON.stringify(donors))
  }, [donors])

  const filteredDonors = donors.filter((donor) => {
    const matchesBlood =
      bloodFilter === 'All' || donor.bloodGroup === bloodFilter

    const searchText = search.toLowerCase().trim()

    const matchesSearch = [
      donor.donorId,
      donor.name,
      donor.contactNumber,
      donor.address,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(searchText)
    )

    return matchesBlood && matchesSearch
  })

  const availableCount = donors.filter(
    (donor) => donor.availability === 'Available'
  ).length

  function openAddForm() {
    setEditingDonor(null)
    setFormData(emptyDonor)
    setFormError('')
  }

  function openEditForm(donor) {
    setEditingDonor(donor.donorId)
    setFormData({ ...donor, age: String(donor.age) })
    setFormError('')
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const donorId = formData.donorId.trim()
    const name = formData.name.trim()
    const age = Number(formData.age)
    const contactNumber = formData.contactNumber.trim()

    if (!donorId || !name || !formData.bloodGroup ||
        !contactNumber || !formData.address.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!Number.isInteger(age) || age < 18 || age > 100) {
      setFormError('Enter a valid age between 18 and 100.')
      return
    }

    if (!/^[0-9]{10}$/.test(contactNumber)) {
      setFormError('Enter a valid 10-digit contact number.')
      return
    }

    const duplicateId = donors.some(
      (donor) =>
        donor.donorId.toLowerCase() === donorId.toLowerCase() &&
        donor.donorId !== editingDonor
    )

    if (duplicateId) {
      setFormError('That donor ID already exists.')
      return
    }

    const updatedDonor = {
      ...formData,
      donorId,
      name,
      age,
      contactNumber,
      address: formData.address.trim(),
    }

    if (editingDonor !== null) {
      setDonors((previous) =>
        previous.map((donor) =>
          donor.donorId === editingDonor ? updatedDonor : donor
        )
      )
    } else {
      setDonors((previous) => [...previous, updatedDonor])
    }

    document.activeElement?.blur()
    window.setTimeout(() => {
      document.getElementById('donor-form-close')?.click()
    }, 0)
  }

  function deleteDonor(donor) {
    const confirmed = window.confirm(
      `Delete the record for ${donor.name} (${donor.donorId})?`
    )

    if (confirmed) {
      setDonors((previous) =>
        previous.filter((item) => item.donorId !== donor.donorId)
      )
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand bg-white border-bottom px-3 px-md-5 py-3">
        <div className="container-fluid p-0">
          <a className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#">
            <span className="brand-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </span>
            <span>Blood<span className="brand-accent">Link</span></span>
          </a>

          <span className="text-secondary small d-none d-sm-inline">
            Blood Donor Management
          </span>
        </div>
      </nav>

      <main className="container-fluid px-3 px-md-5 py-4 py-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <p className="section-label mb-1">DONOR MANAGEMENT</p>
            <h1 className="h3 fw-bold mb-1">Donor Dashboard</h1>
            <p className="text-secondary mb-0">
              Manage donor information and find blood donors easily.
            </p>
          </div>

          <button
            className="btn btn-danger px-4 py-2"
            data-bs-toggle="modal"
            data-bs-target="#donorModal"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add New Donor
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-4">
            <div className="card summary-card h-100">
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <p className="text-secondary mb-2">Total Donors</p>
                  <h2 className="display-6 fw-bold mb-0">{donors.length}</h2>
                </div>
                <div className="summary-icon">
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-4">
            <div className="card summary-card h-100">
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <p className="text-secondary mb-2">Available Donors</p>
                  <h2 className="display-6 fw-bold mb-0">{availableCount}</h2>
                </div>
                <div className="summary-icon available-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-4">
            <div className="card summary-card h-100">
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <p className="text-secondary mb-2">Blood Groups</p>
                  <h2 className="display-6 fw-bold mb-0">
                    {new Set(donors.map((donor) => donor.bloodGroup)).size}
                  </h2>
                </div>
                <div className="summary-icon">
                  <i className="bi bi-droplet-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="card donor-card">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
              <div>
                <h2 className="h5 fw-bold mb-1">Registered Donors</h2>
                <p className="text-secondary small mb-0">
                  View and manage registered donor records.
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <div className="input-group search-box">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search donors..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search donors"
                  />
                </div>

                <select
                  className="form-select blood-filter"
                  value={bloodFilter}
                  onChange={(event) => setBloodFilter(event.target.value)}
                  aria-label="Filter by blood group"
                >
                  <option value="All">All blood groups</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle donor-table mb-0">
                <thead>
                  <tr>
                    <th>Donor ID</th>
                    <th>Donor Details</th>
                    <th>Blood Group</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Availability</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDonors.map((donor) => (
                    <tr key={donor.donorId}>
                      <td className="fw-semibold">{donor.donorId}</td>
                      <td>
                        <div className="fw-semibold">{donor.name}</div>
                        <div className="text-secondary small">
                          {donor.age} years old
                        </div>
                      </td>
                      <td>
                        <span className="blood-badge">{donor.bloodGroup}</span>
                      </td>
                      <td>{donor.contactNumber}</td>
                      <td className="address-cell">{donor.address}</td>
                      <td>
                        <span className={`status-badge ${
                          donor.availability === 'Available'
                            ? 'status-available'
                            : 'status-unavailable'
                        }`}>
                          {donor.availability}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit donor"
                            aria-label={`Edit ${donor.name}`}
                            data-bs-toggle="modal"
                            data-bs-target="#donorModal"
                            onClick={() => openEditForm(donor)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete donor"
                            aria-label={`Delete ${donor.name}`}
                            onClick={() => deleteDonor(donor)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredDonors.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <i className="bi bi-search fs-3 text-secondary"></i>
                        <p className="fw-semibold mt-2 mb-1">No donors found</p>
                        <p className="text-secondary small mb-0">
                          Try another search or blood group.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-secondary small mt-3">
              Showing {filteredDonors.length} of {donors.length} donors
            </div>
          </div>
        </section>

        <p className="text-center text-secondary small mt-4 mb-0">
          BloodLink · Blood Donor Management System
        </p>
      </main>

      <div
        className="modal fade"
        id="donorModal"
        tabIndex="-1"
        aria-labelledby="donorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title fs-5 fw-bold" id="donorModalLabel">
                    {editingDonor ? 'Update Donor Details' : 'Register New Donor'}
                  </h2>
                  <p className="text-secondary small mb-0 mt-1">
                    Enter the donor information below.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4">
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Donor ID *</label>
                    <input
                      className="form-control"
                      name="donorId"
                      value={formData.donorId}
                      onChange={handleChange}
                      placeholder="e.g. D005"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="18"
                      max="100"
                      placeholder="Enter age"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Blood Group *</label>
                    <select
                      className="form-select"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Contact Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Availability *</label>
                    <select
                      className="form-select"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Address *</label>
                    <textarea
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter address or locality"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  id="donor-form-close"
                  className="btn btn-light border"
                  data-bs-dismiss="modal"
                  onClick={() => setFormError('')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger px-4">
                  {editingDonor ? 'Save Changes' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
