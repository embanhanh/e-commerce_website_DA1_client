import React, { useId } from 'react'
import './Rating.scss'

export default function Rating({
    initialRating = 0, // Giá trị rating ban đầu
    gap = 10, // Khoảng cách giữa các ngôi sao
    size = 30, // Kích thước ngôi sao
    readonly = false, // Chế độ chỉ đọc
    onRate, // Callback khi rating thay đổi
}) {
    const id = useId()

    const handleRatingChange = (value) => {
        if (!readonly && onRate) {
            onRate(value)
        }
    }

    return (
        <div className={`rating-container ${readonly ? 'readonly' : ''}`} style={{ gap: `${gap}px` }}>
            {[5, 4, 3, 2, 1].map((value) => (
                <React.Fragment key={value}>
                    <input
                        className={`rating-${value}`}
                        type="radio"
                        name={`rating-${id}`}
                        id={`rating-${value}-${id}`}
                        defaultValue={value}
                        defaultChecked={value === initialRating}
                        disabled={readonly}
                        onChange={() => handleRatingChange(value)}
                    />
                    <label htmlFor={`rating-${value}-${id}`} title={`${value} stars`} style={{ fontSize: `${size}px` }}>
                        <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                        </svg>
                    </label>
                </React.Fragment>
            ))}
        </div>
    )
}
