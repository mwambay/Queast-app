<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class QRCodeGenerator {
    public static function generateOrderQRCode($orderId, $userId) {
        $data = "queast_order:$orderId:user:$userId:" . time();
        
        $qrCode = new QrCode($data);
        $writer = new PngWriter();
        $result = $writer->write($qrCode);
        
        // Créer le répertoire s'il n'existe pas
        if (!file_exists(QR_CODE_DIR)) {
            mkdir(QR_CODE_DIR, 0777, true);
        }
        
        $filename = "order_$orderId.png";
        $path = QR_CODE_DIR . $filename;
        $result->saveToFile($path);
        
        return $filename;
    }
}