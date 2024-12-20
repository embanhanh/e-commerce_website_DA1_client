import Modal from 'react-bootstrap/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import AddAddressModal from './AddAddressModal'
import { useDispatch } from 'react-redux'
import { addNewAddress } from '../redux/slices/userSlice'

function SelectAddressModal({ showAddress, handleCloseAddress, addresses, originalSelectedAddress, handleSelectAddress }) {
    const dispatch = useDispatch()

    const [selectedAddress, setSelectedAddress] = useState(originalSelectedAddress)
    const [showNewAddressModal, setShowAddressModal] = useState(false)
    const [isSelectAddressVisible, setIsSelectAddressVisible] = useState(true) // Thêm trạng thái để điều khiển ẩn/hiện modal

    const handleCloseModal = () => {
        setShowAddressModal(false)
        setIsSelectAddressVisible(true)
    }

    const handleAddAddress = async (newAddressData) => {
        await dispatch(addNewAddress(newAddressData))
        handleCloseModal()
    }

    const handleSetShowModal = () => {
        setShowAddressModal(true)
        setIsSelectAddressVisible(false) // Ẩn SelectAddressModal khi mở AddAddressModal
    }

    return (
        <>
            {isSelectAddressVisible && (
                <Modal show={showAddress} onHide={handleCloseAddress} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="fs-2">Địa chỉ của bạn</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="">
                            <div className="px-3" style={{ maxHeight: 350, overflowY: 'auto' }}>
                                {addresses.map((address) => (
                                    <div key={address._id} className="d-flex py-3 border-bottom">
                                        <label className="d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                className="input-checkbox"
                                                checked={selectedAddress._id === address._id}
                                                onChange={() => {
                                                    if (selectedAddress._id === address._id) {
                                                        setSelectedAddress({})
                                                    } else {
                                                        setSelectedAddress(address)
                                                    }
                                                }}
                                            />
                                            <span className="custom-checkbox"></span>
                                        </label>
                                        <div className="mx-3 flex-grow-1">
                                            <p className="fs-4 fw-medium">{address.name}</p>
                                            <p className="fs-4 fw-medium">{address.phone}</p>
                                            <p className="fs-4 product-name ">{address.location}</p>
                                        </div>
                                        {address.isDefault && (
                                            <div className="m-auto flex-grow-1">
                                                <div className="p-2 border ">
                                                    <p className="fs-3 text-nowrap text-body-tertiary">Mặc định</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 ">
                                <div className="primary-btn p-2 border d-inline-flex align-items-center light shadow-none" variant="secondary" onClick={handleSetShowModal}>
                                    <FontAwesomeIcon icon={faPlus} className="mx-3 fs-3" />
                                    <p className="fs-3">Thêm địa chỉ mới</p>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="primary-btn px-4 py-2 shadow-none light border rounded-3" variant="secondary" onClick={handleCloseAddress}>
                            <p>Đóng</p>
                        </div>
                        <div
                            className="primary-btn px-4 py-2 shadow-none"
                            variant="secondary"
                            onClick={() => {
                                handleSelectAddress(selectedAddress)
                                handleCloseAddress()
                            }}
                        >
                            <p>Xác nhận</p>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}
            <AddAddressModal show={showNewAddressModal} handleClose={handleCloseModal} onAddAddress={handleAddAddress} />
        </>
    )
}

export default SelectAddressModal
