import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Button, Toast } from 'react-bootstrap'

import { fetchProductByProductName } from '../../redux/slices/productSlice'
import { addItemToCart, resetAddToCartSuccess } from '../../redux/slices/cartSlice'
import { getPromotionalComboByProductIdAction } from '../../redux/slices/promotionalComboSlice'

import product1 from '../../assets/image/product_image/product_image_1.png'
import Rating from '../../components/Rating'
import ProductCard from '../../components/ProductCard'
import Notification from '../../components/Notification'
import './ProductDetail.scss'

function ProductDetail() {
    const { product_name } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { isLoggedIn, user } = useSelector((state) => state.auth)
    const { loading: cartLoading, error: cartError, addToCartSuccess } = useSelector((state) => state.cart)
    const { promotionalComboByProduct } = useSelector((state) => state.promotionalCombo)
    // state ...
    const { currentProduct } = useSelector((state) => state.product)
    const [thumbsSwiper, setThumbsSwiper] = useState(null)
    const [mainSwiper, setMainSwiper] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [allImages, setAllImages] = useState([])
    const [uniqueColors, setUniqueColors] = useState([])
    const [selectedColor, setSelectedColor] = useState('')
    const [selectedSize, setSelectedSize] = useState('')
    const [availableQuantity, setAvailableQuantity] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [displayPrice, setDisplayPrice] = useState(0)
    // confirm and notification
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastVariant, setToastVariant] = useState('success')

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                await dispatch(fetchProductByProductName(product_name)).unwrap()
            } catch (error) {
                if (error.status === 404) {
                    navigate('/404')
                }
            }
        }
        fetchProduct()
    }, [dispatch, product_name])

    useEffect(() => {
        if (currentProduct) {
            dispatch(getPromotionalComboByProductIdAction(currentProduct._id))
            const images = [...currentProduct.urlImage, ...currentProduct.variants.map((variant) => variant.imageUrl)]
            setAllImages(images)
            const colors = currentProduct.variants
                .filter((variant) => variant.color)
                .reduce((acc, variant) => {
                    if (!acc.some((item) => item.color === variant.color)) {
                        acc.push({ color: variant.color, imageUrl: variant.imageUrl })
                    }
                    return acc
                }, [])
            setUniqueColors(colors)
            setAvailableQuantity(currentProduct.stockQuantity)
            setDisplayPrice(currentProduct.originalPrice)
        }
    }, [currentProduct])

    useEffect(() => {
        if (currentProduct && (selectedColor || selectedSize)) {
            let filteredVariants = currentProduct.variants

            if (selectedColor) {
                filteredVariants = filteredVariants.filter((v) => v.color === selectedColor)
            }

            if (selectedSize) {
                filteredVariants = filteredVariants.filter((v) => v.size === selectedSize)
            }

            if (filteredVariants.length > 0) {
                const totalQuantity = filteredVariants.reduce((sum, variant) => sum + variant.stockQuantity, 0)
                setAvailableQuantity(totalQuantity)
                setDisplayPrice(filteredVariants[0].price)
            } else {
                setDisplayPrice(currentProduct.originalPrice)
            }
        } else if (currentProduct) {
            setAvailableQuantity(currentProduct.stockQuantity)
        }
    }, [currentProduct, selectedColor, selectedSize])

    const handleColorSelect = (color) => {
        if (color !== selectedColor) {
            setSelectedColor(color)
            const colorVariant = currentProduct.variants.find((v) => v.color === color)
            if (colorVariant && mainSwiper) {
                const imageIndex = allImages.findIndex((img) => img === colorVariant.imageUrl)
                if (imageIndex !== -1) {
                    mainSwiper.slideTo(imageIndex)
                    setActiveIndex(imageIndex)
                }
            }
        } else {
            setSelectedColor('')
        }
    }

    const handleSizeSelect = (size) => {
        if (size !== selectedSize) {
            setSelectedSize(size)
        } else {
            setSelectedSize('')
        }
    }

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }
    }

    const handleIncreaseQuantity = () => {
        if (quantity < availableQuantity) {
            setQuantity(quantity + 1)
        }
    }
    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            setShowLoginModal(true)
        } else {
            try {
                const selectedVariant = currentProduct.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
                if (selectedVariant) {
                    await dispatch(
                        addItemToCart({
                            variant: selectedVariant._id,
                            quantity: quantity,
                        })
                    ).unwrap()
                    setToastMessage('Đã thêm sản phẩm vào giỏ hàng thành công!')
                    setToastVariant('success')
                    setShowToast(true)
                }
            } catch (error) {
                setToastMessage('Có lỗi xảy ra ' + error)
                setToastVariant('error')
                setShowToast(true)
            }
        }
    }

    const handleLoginRedirect = () => {
        setShowLoginModal(false)
        navigate('/user/login', { state: { from: location.pathname } })
    }

    if (!currentProduct) {
        return <div>Đang tải...</div>
    }

    return (
        <>
            <div className="container h-100 p-5 d-flex flex-column gap-5" style={{ minHeight: '500px', marginTop: 'var(--header-height)' }}>
                {!currentProduct ? (
                    <section className="dots-container mt-4">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </section>
                ) : (
                    <>
                        <div className="d-flex p-5 rounded-4 bg-white shadow gap-5">
                            <div style={{ width: '38%' }}>
                                {/* Swiper phía trên */}
                                <div>
                                    <Swiper
                                        loop={true}
                                        spaceBetween={10}
                                        navigation={false}
                                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                        modules={[FreeMode, Navigation, Thumbs]}
                                        className="mySwiper2"
                                        onSwiper={setMainSwiper}
                                        allowTouchMove={false}
                                    >
                                        {allImages.map((product, index) => (
                                            <SwiperSlide key={index}>
                                                <img style={{ objectFit: 'cover', width: '100%' }} src={product} alt={`Ảnh sản phẩm ${index + 1}`} />
                                                <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>

                                <div className="mt-4"></div>

                                {/* Swiper phía dưới */}
                                <div>
                                    <Swiper
                                        style={{
                                            '--swiper-navigation-color': '#fff',
                                        }}
                                        onSwiper={setThumbsSwiper}
                                        loop={false}
                                        spaceBetween={10}
                                        slidesPerView={4}
                                        freeMode={true}
                                        watchSlidesProgress={true}
                                        modules={[FreeMode, Navigation, Thumbs]}
                                        direction="horizontal" // Chiều ngang (từ trái sang phải)
                                        className="mySwiper-sub"
                                        navigation={true}
                                    >
                                        {allImages.map((product, index) => (
                                            <SwiperSlide key={index}>
                                                <img
                                                    style={{
                                                        objectFit: 'cover',
                                                        width: '100%',
                                                        cursor: 'pointer',
                                                        border: activeIndex === index ? '2px solid var(--theme-color)' : 'none',
                                                    }}
                                                    src={product}
                                                    alt={`Product ${index + 1}`}
                                                    onMouseEnter={() => {
                                                        if (mainSwiper) {
                                                            mainSwiper.slideTo(index)
                                                            setActiveIndex(index)
                                                        }
                                                    }}
                                                />
                                                <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                            <div style={{ width: '60%' }} className="px-5 py-1 ms-5">
                                <p className="fs-1 lh-1 fw-bold theme-color">{currentProduct.name}</p>
                                <div className="d-flex py-3 gap-3">
                                    <p className="me-2 fs-2  fw-medium align-self-end">{currentProduct.rating} </p>{' '}
                                    <Rating initialRating={currentProduct.rating} readonly={true} size={24} className="mx-3" />
                                    <p className="fs-3 align-self-end">(100 đánh giá)</p>
                                </div>
                                <div className="d-flex gap-5 align-items-center p-4 shadow-sm rounded-4 bg-theme">
                                    <p className="fs-1 fw-medium theme-color">{displayPrice - (displayPrice * currentProduct.discount) / 100}đ</p>
                                    {/* {currentProduct.discount > 0 && (
                                        <> */}
                                    <p className="fs-2 fw-medium text-decoration-line-through text-body-tertiary">{displayPrice}đ</p>
                                    <div className="product-badge discount-badge position-static ms-auto">- {currentProduct.discount}% </div>
                                    {/* </>
                                    )} */}
                                </div>
                                {currentProduct.variants.some((variant) => variant.color) && <p className="fs-3 lh-1 my-4 theme-color fw-semibold">Màu Sắc</p>}
                                <div className="row g-3">
                                    {uniqueColors.map((variant, index) => {
                                        if (variant.color) {
                                            return (
                                                <div className="col-3 px-3" key={index}>
                                                    <div
                                                        className={`${
                                                            selectedColor == variant.color ? 'border-theme border' : ''
                                                        } product-color p-2 h-100 border d-flex align-items-center justify-content-center rounded-3`}
                                                        onClick={() => handleColorSelect(variant.color)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <img src={variant.imageUrl} alt={`màu sắc ${index + 1}`} className="color-img-product" />
                                                        <p className="fs-3 ms-3 theme-color">{variant.color}</p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    })}
                                </div>
                                {currentProduct.variants.some((variant) => variant.size) && <p className="fs-3 lh-1 my-4 theme-color fw-semibold">Size</p>}
                                <div className="d-flex">
                                    {currentProduct.variants.some((variant) => variant.size) && (
                                        <>
                                            {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                                                <div
                                                    key={size}
                                                    className={`primary-btn light ${selectedSize === size ? 'size-selected' : ''} py-2 px-4 shadow-none me-3`}
                                                    onClick={() => handleSizeSelect(size)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <p>{size}</p>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                                <p className="fs-3 lh-1 my-4 theme-color fw-semibold">Số lượng</p>
                                <div className=" d-flex align-items-center mt-4">
                                    <div className="d-flex align-items-center px-1 py-1 rounded-4 border border-black ">
                                        <FontAwesomeIcon icon={faMinus} size="lg" className="p-4" onClick={handleDecreaseQuantity} />
                                        <p className="fs-3 fw-medium lh-1 mx-2">{quantity}</p>
                                        <FontAwesomeIcon icon={faPlus} size="lg" className="p-4" onClick={handleIncreaseQuantity} />
                                    </div>

                                    <p className="fs-3 fw-medium ms-4">{availableQuantity} sản phẩm có sẵn</p>
                                </div>
                                <div className="d-flex align-items-center mt-4 position-relative">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={
                                            availableQuantity === 0 ||
                                            !(!currentProduct.variants.some((variant) => variant.color) || selectedColor) ||
                                            !(!currentProduct.variants.some((variant) => variant.size) || selectedSize) ||
                                            quantity > availableQuantity ||
                                            user?.role === 'admin'
                                        }
                                        className="cartBtn d-flex align-items-center justify-content-center"
                                    >
                                        <svg style={{ height: 18 }} className="cart" fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
                                        </svg>
                                        <p className="fs-4">Thêm vào giỏ hàng</p>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" className="product">
                                            <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z"></path>
                                        </svg>
                                        {cartLoading && (
                                            <div className="dot-spinner ms-4">
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                                <div className="dot-spinner__dot"></div>
                                            </div>
                                        )}
                                    </button>
                                    <div className="position-absolute tooltip-cartbtn">
                                        <p>Bạn phải chọn phân loại hàng trước khi thêm vào giỏ hàng</p>
                                    </div>
                                </div>
                                {promotionalComboByProduct && (
                                    <div className="p-4 rounded-4 combo-info-container mt-4 shadow-sm">
                                        <p className="fs-4">
                                            {promotionalComboByProduct.discountCombos.map((combo, index) => (
                                                <span key={combo._id} className="lh-1">
                                                    Mua <strong className="theme-color fs-3">{combo.quantity}</strong> sản phẩm sẽ được giảm{' '}
                                                    <strong className="theme-color fs-3">
                                                        {combo.discountValue} {promotionalComboByProduct.comboType === 'percentage' ? '%' : 'đ'}{' '}
                                                    </strong>
                                                    {index < promotionalComboByProduct.discountCombos.length - 1 && ' hoặc '}
                                                </span>
                                            ))}
                                        </p>
                                        <p className="fs-4">
                                            Giới hạn sản phẩm để nhận combo là <strong className="theme-color fs-3">{promotionalComboByProduct.limitCombo}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pe-5 rounded-4 bg-white shadow p-5">
                            <p className="fs-2 fw-medium p-2 bg-body-tertiary">Mô tả sản phẩm</p>
                            <p className="fs-3 my-4 ms-3">{currentProduct.description}</p>
                            <p className="fs-2 fw-medium p-2 bg-body-tertiary">Chi tiết sản phẩm</p>
                            <div className="row ms-2 my-2">
                                <div className="col-3">
                                    <p className="fs-3 py-2 text-body-tertiary">Danh mục</p>
                                    <p className="fs-3 py-2 text-body-tertiary">Chất liệu</p>
                                    <p className="fs-3 py-2 text-body-tertiary">Thương hiệu</p>
                                    <p className="fs-3 py-2 text-body-tertiary">Xuất xứ</p>
                                    <p className="fs-3 py-2 text-body-tertiary">Kho</p>
                                </div>
                                <div className="col-9">
                                    <p className="fs-3 py-2">{currentProduct.categories.map((category) => category.name).join(', ')}</p>
                                    <p className="fs-3 py-2">{currentProduct.material || 'Không có'}</p>
                                    <p className="fs-3 py-2">{currentProduct.brand || 'Không có'}</p>
                                    <p className="fs-3 py-2">...</p>
                                    <p className="fs-3 py-2">{currentProduct.stockQuantity}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-4 bg-white shadow p-5">
                            <p className="fs-2 fw-medium py-2">Đánh giá của khách hàng</p>
                            {Array.from({ length: 2 }).map((_, index) => (
                                <div className="pe-5 me-5 my-4 border-bottom py-4 " key={index}>
                                    <div className="d-flex align-items-center justify-self-end mt-auto">
                                        <img src="" alt="" className="rounded-circle" style={{ height: 50, width: 50 }} />
                                        <div className="ms-3">
                                            <p className="fw-medium  fs-3">Trần Trung Thông</p>
                                            <Rating initialRating={5} readonly={true} size={18} />
                                        </div>
                                    </div>
                                    <p className="my-2 ps-5 ms-5 text-body-tertiary"> 2024-22-9 10:00</p>
                                    <p className="fs-3 ps-5 ms-5">
                                        Mình rất ấn tượng với trải nghiệm mua sắm tại website thời trang này. Giao diện được thiết kế hiện đại và tinh tế, giúp mình dễ dàng tìm kiếm và lựa chọn sản
                                        phẩm phù hợp. Mình chắc chắn sẽ quay lại đây để tiếp tục mua sắm trong tương lai!
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <p className="fs-1 theme-color fw-medium">Sản phẩm liên quan</p>
                            <div className="row mt-5 g-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-2 " key={index}>
                                        <ProductCard url={product1} name={'Giày thể thao'} originalPrice={150000} discount={20} rating={5} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Notification type="info" title="Thông báo" description="Vui lòng đăng nhập để tiếp tục mua hàng">
                    <div className="d-flex gap-4 align-items-center justify-content-center bg-white">
                        <button className=" border px-4 py-2 bg-white rounded-4" onClick={() => setShowLoginModal(false)}>
                            <p className="fs-4">Hủy</p>
                        </button>
                        <button className="primary-btn info-btn py-2 px-4 rounded-4" onClick={handleLoginRedirect}>
                            <p className="fs-4">Đăng nhập</p>
                        </button>
                    </div>
                </Notification>
            </Modal>
            <Modal show={showToast} onHide={() => setShowToast(false)} centered>
                <Notification type={toastVariant} title="Thông báo" description={toastMessage} />
            </Modal>
        </>
    )
}

export default ProductDetail
