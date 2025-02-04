# sys-notification
. Hệ thống phát thông báo kết hợp RabbitMQ với SocketIO
Hệ thống đẩy thông báo về người dùng trong hệ thống:
-	Thông báo được tạo ra lưu vào CSDL.
-	Tùy thuộc vào loại thông báo với mã riêng sẽ được xử lý đẩy lên hàm đợi RabbitMQ.
-	Server xử lý thông tin thông báo nhận được trong hàm đợi đẩy về cho các người nhận thông báo đích bằng SocketIO. 
 ![image](https://github.com/user-attachments/assets/0c9de374-426b-49db-a9f8-6204d19307d9)
Hình 3.5 Biểu đồ hệ thống đẩy thông báo
Xử lý hàm đợi trong RabbitMQ:
Sử dụng fanout exchange của RabbitMQ định tuyến message tới tất cả queue mà nó bao quanh. Giúp phân luồng thông báo cho các hàm đợi để xử lý.
 ![image](https://github.com/user-attachments/assets/b2a4db70-5787-44ee-a481-d150a4c030a8)
Hình 3.6 Xử lý hàm đợi bằng fanout exchange
Direct Exchange vận chuyển message đến queue dựa vào routing key. Sử dụng để đẩy các thông báo đồng thời cho nhiều người nhận đích.
 ![image](https://github.com/user-attachments/assets/3bbe5440-809c-4097-bb16-dc40eded63b0)
Hình 3.7 Xử lý phát thông báo đồng thời bằng direct exchange
