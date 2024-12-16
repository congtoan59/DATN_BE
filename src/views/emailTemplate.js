module.exports = (resetLink, cusName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .logo-container {
            display: flex;
            justify-content: center; 
            align-items: center;    
            padding: 20px;          
            /* (Tùy chọn) màu nền của box */
        }

        .logo-container img {
            width: 30%;   
            height: auto; 
            border-radius: 5px; 
            margin: 0 auto;
        }
        .header {
            background-color: #6F4E37; /* Màu nâu */
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            color: #333; /* Màu đen */
            text-align: center;
        }
        .content h2 {
            font-size: 20px;
            margin-bottom: 10px;
            color: #6F4E37; /* Màu nâu */
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #333; /* Màu đen */
        }
        .content .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #6F4E37; /* Màu nâu */
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            background-color: #f4f4f4;
            color: #666666;
            padding: 10px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #6F4E37; /* Màu nâu */
            text-decoration: none;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Đặt lại mật khẩu của bạn</h1>
        </div>
        
        <!-- Nội dung -->
        <div class="logo-container">
            <img src="https://instagram.fhan14-5.fna.fbcdn.net/v/t51.29350-15/468745960_920985172910541_9145972786427306212_n.jpg?stp=dst-jpg_e15&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi42MTJ4MzQ0LnNkci5mMjkzNTAuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.fhan14-5.fna.fbcdn.net&_nc_cat=109&_nc_ohc=lahbRLvbtnUQ7kNvgEe5au0&_nc_gid=8e194c3dddb54750aeae8bb4e591a7bb&edm=AA5fTDYBAAAA&ccb=7-5&ig_cache_key=MzUxMjYzNzI0NDc5MzgzNjM4MQ%3D%3D.3-ccb7-5&oh=00_AYAEdltbKvr9pzmqb-m7xowRFFxIAGwXLp87k5xS3PKm0w&oe=6750A584&_nc_sid=7edfe2" 
            alt="Logo Sixstars" />
        </div>

        <div class="content">
            <h2>Xin chào ${cusName},</h2>
            <p>
                Bạn đã yêu cầu đặt lại mật khẩu. Để đặt lại mật khẩu của bạn, hãy nhấn vào nút bên dưới:
            </p>
            <a href="${resetLink}" class="btn">Đặt lại mật khẩu</a>
            <p>
                Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ chúng tôi qua <a href="mailto:support@example.com">helper@sixstars.com</a>.
            </p>
            <p>© 2024 Sixstars. Tất cả quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>
`;
