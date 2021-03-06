<?php
// Файлы phpmailer
require 'lib/class.phpmailer.php';
require 'lib/class.smtp.php';

// Настройки
$mail = new PHPMailer;

$mail->isSMTP();
$mail->CharSet = 'UTF-8';
$mail->Host = 'smtp.yandex.ru';
$mail->SMTPAuth = true;
$mail->Username = 'anxieter'; // Ваш логин в Яндексе. Именно логин, без @yandex.ru
$mail->Password = '7a068ae29'; // Ваш пароль
$mail->SMTPSecure = 'ssl';
$mail->Port = 465;
$mail->setFrom('anxieter@yandex.ru'); // Ваш Email
$mail->addAddress('anxieter@gmail.com'); // Email получателя
// $mail->addAddress('aleksey.flce@gmail.com'); // Еще один email, если нужно.

// Прикрепление файлов
  for ($ct = 0; $ct < count($_FILES['userfile']['tmp_name']); $ct++) {
        $uploadfile = tempnam(sys_get_temp_dir(), sha1($_FILES['userfile']['name'][$ct]));
        $filename = $_FILES['userfile']['name'][$ct];
        if (move_uploaded_file($_FILES['userfile']['tmp_name'][$ct], $uploadfile)) {
            $mail->addAttachment($uploadfile, $filename);
        } else {
            $msg .= 'Failed to move file to ' . $uploadfile;
        }
    }

// Письмо
$mail->isHTML(true);
$mail->Subject = "Заказ на верстку"; // Заголовок письма
//$mail->Body    = "Имя $name . Текст $text . Почта $email";  Текст письма

// Обход массива

foreach($_POST['type'] as $k => $v) {
	if($v) {
		$type = $v;
	}
}

foreach($_POST['usluga'] as $k => $v) {
	if($v) {
		$usluga = $v;
	}
}

$mail->Body = "Имя: {$_POST['name']}<br> Email: {$_POST['email']}<br> Тематика: {$_POST['theme']}<br> Тип сайта: $type<br> Тип услуги: $usluga<br> Наличие исходников: {$_POST['ishodn']}<br> Наличие текстов: {$_POST['texts']}<br> Наличие технического задания: {$_POST['tz']}<br> Сообщение: " . nl2br($_POST['comment']);

// Результат
if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'ok';
}
?>
