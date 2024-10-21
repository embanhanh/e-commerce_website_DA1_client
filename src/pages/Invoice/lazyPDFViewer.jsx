import React from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import InvoiceComponent from '../../components/InvoiceComponent'

const LazyPDFViewer = ({ order, shop }) => {
    return (
        <PDFViewer width="100%" style={{ height: '100vh' }} className="app">
            <InvoiceComponent order={order} shop={shop} />
        </PDFViewer>
    )
}

export default LazyPDFViewer
