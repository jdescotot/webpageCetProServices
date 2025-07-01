<?php
// Usar las clases de PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carga los archivos de PHPMailer (asume que la carpeta PHPMailer está al mismo nivel que este script)
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Comprueba si el formulario fue enviado usando POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Recoge y limpia los datos del formulario
    $name = strip_tags(trim($_POST["name"]));
    $company = strip_tags(trim($_POST["company"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $phone = strip_tags(trim($_POST["phone"]));
    $employees = strip_tags(trim($_POST["employees"]));
    $service = strip_tags(trim($_POST["service"]));
    $message = strip_tags(trim($_POST["message"]));

    // Validación
    if (empty($name) || empty($company) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Por favor completa los campos requeridos."]);
        exit;
    }

    // Crea una nueva instancia de PHPMailer
    $mail = new PHPMailer(true);

    try {
        // ---- Configuración del Servidor SMTP de Hostinger ----
        $mail->isSMTP();
        $mail->Host       = 'smtp.hostinger.com'; // Servidor SMTP de Hostinger
        $mail->SMTPAuth   = true;
        $mail->Username   = 'contact@cetproservices.com'; // TU CORREO
        $mail->Password   = 'AQUÍ_VA_LA_CONTRASEÑA_DE_TU_CORREO';  // ¡¡¡REEMPLAZA ESTO!!!
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587; // Puerto para TLS

        // ---- Configuración del Correo ----
        // Quién envía el correo (tu misma cuenta de correo)
        $mail->setFrom('contact@cetproservices.com', $name);
        
        // A quién se le envía el correo (a ti mismo)
        $mail->addAddress('contact@cetproservices.com', 'CET Pro Services');
        
        // Permite que al "Responder", se responda al email del cliente
        $mail->addReplyTo($email, $name);

        // ---- Contenido del Correo ----
        $mail->isHTML(true);
        $mail->Subject = 'Nuevo Mensaje del Formulario de Contacto de: ' . $company;
        
        // Cuerpo del mensaje
        $mail->Body    = "<h2>Nueva consulta recibida desde cetproservices.com</h2>
                        <p><strong>Nombre:</strong> {$name}</p>
                        <p><strong>Empresa:</strong> {$company}</p>
                        <p><strong>Email:</strong> {$email}</p>
                        <p><strong>Teléfono:</strong> {$phone}</p>
                        <p><strong>Tamaño de la Empresa:</strong> {$employees}</p>
                        <p><strong>Servicio de Interés:</strong> {$service}</p>
                        <hr>
                        <p><strong>Mensaje:</strong><br>" . nl2br($message) . "</p>";
        
        // Texto alternativo para clientes de correo que no soportan HTML
        $mail->AltBody = "Has recibido un nuevo mensaje.\n\nNombre: {$name}\nEmpresa: {$company}\nEmail: {$email}\nTeléfono: {$phone}\nMensaje: {$message}";

        $mail->send();
        
        // Respuesta de éxito para el JavaScript
        echo json_encode(["status" => "success", "message" => "¡Mensaje enviado exitosamente!"]);

    } catch (Exception $e) {
        // Respuesta de error si algo falla
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "El mensaje no pudo ser enviado. Error: {$mail->ErrorInfo}"]);
    }
} else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Hubo un problema con tu envío, por favor intenta de nuevo."]);
}
?>