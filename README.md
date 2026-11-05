# THƯ VIỆN 100 HUYỆT ĐẠO — HƯỚNG DẪN ĐĂNG WEB LÊN GITHUB PAGES VÀ BLOGGER

> **Dành cho người mới:** Chỉ cần làm từ trên xuống, không cần biết lập trình. Hướng dẫn áp dụng cho website HTML/CSS/JavaScript thuần, miễn phí, dùng GitHub Pages để lưu website và Blogger để hiển thị bằng một khung nhúng (iframe).
>
> **Cập nhật bản đóng gói hoàn chỉnh:** `WEBSITE_HUYET_SAN_SANG_UP_GITHUB.zip` đã có đủ 100 huyệt, 200 ảnh và mã `app.js` tương thích 14 trường của `data.json`. Chỉ cần giải nén; không trộn các tệp với ZIP mẫu 5 huyệt cũ.

## MỤC LỤC

- [Giới thiệu và chuẩn bị](#chuan-bi)
- [Phần A — Đưa website lên GitHub Pages](#phan-a)
  - [A1. Tạo tài khoản GitHub](#a1)
  - [A2. Tạo kho lưu trữ (repository)](#a2)
  - [A3. Tải tệp, kể cả 200 ảnh, lên GitHub](#a3)
  - [A4. Bật GitHub Pages](#a4)
  - [A5. Lấy địa chỉ website](#a5)
  - [A6. Kiểm tra website](#a6)
- [Phần B — Nhúng website vào Blogger](#phan-b)
  - [B1. Chuẩn bị mã iframe](#b1)
  - [B2. Dán vào Blogger](#b2)
  - [B3. Kiểm tra trên máy tính và điện thoại](#b3)
- [Phần C — Cập nhật dữ liệu, ảnh và bộ nhớ đệm](#phan-c)
  - [C1. Sửa hoặc thêm huyệt trong data.json](#c1)
  - [C2. Thay ảnh huyệt](#c2)
  - [C3. Xử lý dữ liệu cũ do cache](#c3)
- [Phần D — 10 lỗi thường gặp và cách sửa](#phan-d)
- [Phần E — Câu hỏi thường gặp](#phan-e)
- [Tự kiểm tra trước khi công bố](#kiem-tra-cuoi)
- [Nguồn hướng dẫn chính thức](#nguon)

<a id="chuan-bi"></a>
## GIỚI THIỆU DỰ ÁN VÀ YÊU CẦU CHUẨN BỊ

**Thư viện 100 huyệt đạo** là trang tra cứu bằng tiếng Việt, có ô tìm theo từ khóa (kể cả không dấu), nút chọn 7 vùng cơ thể, hình minh họa và trang chi tiết từng huyệt. Website được lưu miễn phí trên **GitHub Pages** (nơi chứa các tệp web), sau đó **Blogger** chỉ cần một đoạn iframe ngắn để hiển thị. Sửa dữ liệu về sau ở GitHub, **không cần dán lại mã HTML lớn vào Blogger**.

**Trước khi bắt đầu, bạn chuẩn bị:**

1. Một tài khoản **Gmail** đang sử dụng (hoặc email khác) để đăng ký GitHub; tài khoản Google để đăng nhập Blogger.
2. Máy tính Windows có mạng, trình duyệt Chrome hoặc Edge; điện thoại để kiểm tra hiển thị sau cùng.
3. **File ZIP dự án** `WEBSITE_HUYET_SAN_SANG_UP_GITHUB.zip` chứa đầy đủ website và 200 ảnh đã chuẩn hóa. **Không** tải thẳng tệp ZIP lên repository rồi mong website tự giải nén.
4. File **`data.json` 100 huyệt** đã nghiệm thu tại Bước 1 và được tích hợp sẵn trong ZIP.
5. Một thư mục trên máy, ví dụ `D:\THU_VIEN_HUYET`, nơi bạn **giải nén** tệp ZIP.

**Bố cục thư mục cần có sau khi giải nén:**

```text
THU_VIEN_HUYET/
├── index.html                 ← trang chủ (nằm NGAY thư mục gốc)
├── style.css                  ← giao diện
├── app.js                     ← tìm kiếm, lọc, cửa sổ chi tiết
├── data.json                  ← danh sách huyệt của phiên bản đang chạy
├── data.local.js              ← dùng khi mở web trực tiếp trên máy
├── sw.js                      ← quản lý bộ nhớ đệm khi lên HTTPS
├── images/
│   ├── huyet-001.jpg ... huyet-100.jpg
│   └── thumb/
│       └── huyet-001.webp ... huyet-100.webp
├── README.md                  ← tệp hướng dẫn bạn đang đọc
└── HUONG_DAN_CHAY.txt          ← 5 dòng mở website nhanh
```

Gói hoàn chỉnh đã có **100 ảnh JPG và 100 ảnh WebP** đúng tên; không cần chạy script đổi tên. Khi đăng GitHub, đưa **các tệp bên trong thư mục `WEBSITE_HUYET_HOAN_CHINH`** lên gốc repository (không tải nguyên file ZIP).

---

<a id="phan-a"></a>
## PHẦN A — ĐƯA WEBSITE LÊN GITHUB PAGES

<a id="a1"></a>
### A1. Tạo tài khoản GitHub

1. Mở **https://github.com/signup** bằng Chrome/Edge.
2. Nhập email, tạo mật khẩu, chọn **username** (tên tài khoản viết liền, ví dụ `huongdanhuyet`), làm theo hướng dẫn xác minh trên màn hình.
3. Mở email nếu GitHub yêu cầu xác nhận. Sau đó đăng nhập tại **https://github.com**.

**Bạn sẽ thấy:** Trang GitHub có hình đại diện tài khoản ở góc trên bên phải; vị trí và màu nút có thể thay đổi theo giao diện.

**Kết quả mong đợi:** Bạn đã đăng nhập vào GitHub và biết chính xác **username** của mình.

**Nếu gặp lỗi:** Không nhận email thì kiểm tra hộp thư Spam/Thư rác và nhập đúng địa chỉ email; tên tài khoản đã có người dùng thì chọn tên khác. **Không chia sẻ mật khẩu hoặc mã xác minh cho người khác.**

<a id="a2"></a>
### A2. Tạo repository (kho lưu trữ website)

*Repository* là nơi GitHub lưu các tệp website.

1. Khi đã đăng nhập GitHub, bấm dấu **`+`** ở góc trên bên phải → **New repository**; hoặc mở **https://github.com/new**.
2. Ô **Repository name**: nhập `thu-vien-huyet` (không dấu, không khoảng trắng).
3. Chọn **Public** (công khai; dùng GitHub Pages miễn phí với GitHub Free).
4. Đánh dấu **Add a README file** nếu có. Việc này tạo sẵn trang thông tin và giúp dễ thao tác từ GitHub Desktop.
5. Bấm nút **Create repository** (thường là nút nổi bật màu xanh lá ở cuối biểu mẫu).

**Bạn sẽ thấy:** Trang kho mới với các tab **Code**, **Issues**, **Settings**... và tên `thu-vien-huyet` ở đầu.

**Kết quả mong đợi:** Địa chỉ kho có dạng `https://github.com/TEN_TAI_KHOAN/thu-vien-huyet` (chưa phải địa chỉ website).

**Nếu gặp lỗi:** Nếu tên kho báo đã tồn tại trong tài khoản, đặt tên khác (ví dụ `thu-vien-100-huyet`) và dùng **đúng tên đó** trong tất cả đường dẫn phía sau. Nếu vô tình chọn Private, vào **Settings → General → Danger Zone → Change repository visibility** để chuyển sang Public; GitHub có thể yêu cầu xác nhận.

<a id="a3"></a>
### A3. Tải toàn bộ tệp lên GitHub, kể cả thư mục 200 ảnh

**Quan trọng:** File `index.html`, `app.js`, `style.css`, `data.json`, `sw.js` phải ở **ngay thư mục gốc** của repository. Không để nằm trong một thư mục con như `HUYET_GITHUB_FULL_100_ANH/index.html`.

**Cách 1 — Khuyên dùng khi có 200 ảnh: GitHub Desktop (miễn phí).** Bạn chỉ cần kéo/copy các tệp trên Windows:

1. Cài **GitHub Desktop** tại **https://desktop.github.com/**, mở lên và chọn **Sign in to GitHub.com**.
2. Trong GitHub Desktop chọn **File → Clone repository** (tải kho trên GitHub về máy) → tab **GitHub.com** → chọn `thu-vien-huyet` → chọn nơi lưu, ví dụ `D:\GITHUB\thu-vien-huyet` → bấm **Clone**.
3. Mở hai cửa sổ File Explorer: cửa sổ thứ nhất là thư mục ZIP **đã giải nén** (`D:\THU_VIEN_HUYET`), cửa sổ thứ hai là thư mục vừa Clone (`D:\GITHUB\thu-vien-huyet`).
4. **Sao chép các tệp và cả thư mục `images` từ BÊN TRONG thư mục giải nén** sang thư mục Clone. Nếu Windows hỏi thay tệp README cũ, kiểm tra rồi chọn thay thế bằng `README.md` hướng dẫn này nếu bạn muốn. **Không xóa** thư mục ẩn `.git` trong thư mục Clone.
5. Quay lại GitHub Desktop. Phần **Changes** sẽ liệt kê nhiều tệp mới; góc dưới trái, ô **Summary**, nhập `Them website va 200 anh huyet`.
6. Bấm **Commit to main**, sau đó ở thanh trên bấm **Push origin** (đẩy thay đổi lên GitHub).
7. Mở lại repository trên trang web GitHub, tải lại trang để xem các tệp vừa xuất hiện.

**Bạn sẽ thấy:** Danh sách tệp ở tab **Code**, có `images`, `index.html`, `app.js`, `data.json`... Khi mở `images` sẽ thấy 100 tệp `.jpg`; vào `images/thumb` thấy 100 `.webp`.

**Kết quả mong đợi:** Đã đưa trọn 200 ảnh và các tệp web lên GitHub chỉ trong một lần Commit/Push.

**Nếu gặp lỗi:** Nếu nút **Push origin** báo cần đăng nhập, hoàn tất đăng nhập GitHub Desktop rồi bấm lại. Nếu repo không thấy trong tab GitHub.com, chọn **File → Clone repository → URL** và dán địa chỉ kho GitHub của bạn. Nếu không thấy tệp trong Changes, kiểm tra có copy **đúng thư mục Clone** không.

**Cách 2 — Không cài phần mềm, dùng trang web GitHub:**

1. Vào repository → tab **Code** → **Add file → Upload files** (trong giao diện mới, nút có thể là **Add file** ở phía trên danh sách tệp).
2. Kéo các **tệp đã giải nén** vào vùng có dòng hướng dẫn thả tệp, kiểm tra tên và đường dẫn hiển thị. Để giữ cấu trúc thư mục, hãy kéo đúng thư mục hoặc sử dụng GitHub Desktop nếu trình duyệt không nhận thư mục.
3. **Không tải quá 100 tệp/lượt.** Ví dụ tải nhóm tệp lõi trước, rồi chia ảnh JPG thành 2 lượt (001–050 và 051–100), WebP thành 2 lượt tương tự; nếu giao diện báo lỗi với nhiều tệp, giảm còn khoảng 30–50 tệp mỗi lượt.
4. Ở cuối trang, nhập lời ghi chú (ví dụ `Them anh huyet dot 1`) rồi bấm **Commit changes**. Tiếp tục cho đến khi đủ tệp.
5. Kiểm tra đường dẫn thật của JPG và WebP trong tab **Code**. **Không** để ảnh ở gốc kho hoặc sai tên thư mục `thumb`.

**Bạn sẽ thấy:** Sau mỗi lần **Commit changes**, GitHub trở về danh sách tệp. Tệp ảnh được thêm dần.

**Kết quả mong đợi:** `images/huyet-001.jpg` đến `images/huyet-100.jpg` và `images/thumb/huyet-001.webp` đến `images/thumb/huyet-100.webp` có trên GitHub.

**Nếu gặp lỗi:** GitHub giới hạn tải qua trình duyệt ở **100 tệp/lượt** và **25 MiB cho mỗi tệp**; nếu báo quá giới hạn, chia nhỏ hoặc dùng GitHub Desktop. Không tải file ZIP nguyên vẹn lên thay thế các tệp đã giải nén.

<a id="a4"></a>
### A4. Bật GitHub Pages (xuất bản website)

1. Mở repository `thu-vien-huyet` của bạn trên GitHub.
2. Bấm tab **Settings** nằm cạnh các tab Code / Actions (nếu chưa thấy, mở menu bổ sung `...` hoặc phần tab bị ẩn).
3. Trong cột bên trái, tìm mục **Pages** (thường nằm dưới nhóm **Code and automation**).
4. Trong ô **Build and deployment**, mục **Source**, chọn **Deploy from a branch**.
5. Mục **Branch** chọn `main`, bên cạnh chọn `/(root)` → bấm **Save**.

**Bạn sẽ thấy:** Phần cài đặt Pages hiển thị nhánh `main`, thư mục `/(root)`; khi xuất bản xong, thường có nút **Visit site**.

**Kết quả mong đợi:** GitHub bắt đầu xuất bản website. Lần đầu hoặc sau khi thay đổi có thể mất **tối đa khoảng 10 phút** theo tài liệu GitHub.

**Nếu gặp lỗi:** Mục Branch không có `main` nghĩa là kho chưa có commit hoặc đang dùng tên nhánh khác; quay lại tab Code kiểm tra. Nếu báo **404**, xem mục **D1** bên dưới.

<a id="a5"></a>
### A5. Lấy link website chính thức

1. Vào lại **Settings → Pages**.
2. Bấm **Visit site** khi có. Bạn cũng có thể tự gõ đường dẫn mẫu sau (thay cả username và tên repo nếu khác):

```text
https://TEN_TAI_KHOAN.github.io/thu-vien-huyet/
```

3. Sao chép toàn bộ địa chỉ trong thanh địa chỉ trình duyệt và giữ lại ở Notepad.

**Bạn sẽ thấy:** Trang tra cứu, không phải trang hiển thị danh sách tệp GitHub. Địa chỉ bắt đầu bằng `https://`.

**Kết quả mong đợi:** Bạn đã có một đường dẫn website công khai để nhúng vào Blogger.

**Nếu gặp lỗi:** Không sử dụng link `https://github.com/...` để làm địa chỉ iframe — đó là link kho chứa mã, không phải website. Nếu Visit site chưa xuất hiện, kiểm tra Pages và chờ xuất bản hoàn tất.

<a id="a6"></a>
### A6. Kiểm tra website hoạt động

1. Mở link GitHub Pages trên máy tính. Xem có tiêu đề **Thư viện 100 huyệt đạo**, ô tìm kiếm và 7 nút vùng cơ thể không.
2. Thử gõ `than`, `lưng`, `đau đầu`, tên huyệt **Phong Trì**. Từ không dấu phải được nhận diện.
3. Bấm một kết quả để mở ảnh lớn; thử **Lưu yêu thích**, **Chia sẻ**, tăng/giảm chữ và quay lại đầu trang.
4. Mở bằng **điện thoại** và kiểm tra không phải kéo ngang để đọc.
5. Thử mở link ảnh đơn lẻ, chẳng hạn:

```text
https://TEN_TAI_KHOAN.github.io/thu-vien-huyet/images/huyet-019.jpg
```

**Bạn sẽ thấy:** Trang tra cứu có kết quả và ảnh tương ứng. Trên điện thoại, các nút đủ rộng để bấm.

**Kết quả mong đợi:** Trang website chạy qua HTTPS, nạp **100/100 huyệt**, có hình và đủ 7 nhóm.

**Nếu gặp lỗi:** Kiểm tra đủ cả `app.js`, `data.json`, `data.local.js` và `images/` của **cùng ZIP hoàn chỉnh**, tránh trộn nhầm mã từ bản 5 huyệt.

---

<a id="phan-b"></a>
## PHẦN B — NHÚNG WEBSITE VÀO BLOGGER BẰNG IFRAME

*Iframe* là một khung hiển thị website GitHub Pages ngay trong blog. Blogger chỉ lưu vài dòng mã, **không chứa 200 ảnh**.

<a id="b1"></a>
### B1. Chuẩn bị mã iframe

1. Dùng đường dẫn GitHub Pages thật lấy tại **A5**.
2. Sao chép đoạn mã sau. **Thay `TEN_TAI_KHOAN` ở cả hai dòng liên kết** bằng tên GitHub thật; nếu repo đổi tên thì thay `thu-vien-huyet` tương ứng.

```html
<div style="max-width:1200px;width:100%;margin:0 auto;">
  <p style="text-align:right;margin:0 0 10px;">
    <a href="https://TEN_TAI_KHOAN.github.io/thu-vien-huyet/"
       target="_blank" rel="noopener noreferrer">⤢ Mở toàn màn hình</a>
  </p>
  <iframe src="https://TEN_TAI_KHOAN.github.io/thu-vien-huyet/"
          title="Tra cứu 100 huyệt đạo"
          style="display:block;width:100%;height:85vh;min-height:600px;border:0;border-radius:12px;"
          allow="clipboard-write; web-share"></iframe>
</div>
```

**Bạn sẽ thấy:** Một đoạn HTML ngắn, gồm đường dẫn mở trong tab riêng và đường dẫn hiển thị trong iframe.

**Kết quả mong đợi:** Mã đã trỏ về **đúng một website**. Dòng “Mở toàn màn hình” sẽ mở trang độc lập ở tab mới (không phải lệnh chuyển trình duyệt sang chế độ F11).

**Nếu gặp lỗi:** Quên thay `TEN_TAI_KHOAN`, sai tên repo hoặc thiếu `/` trong đường dẫn có thể làm khung hiển thị trắng/404. Thử mở địa chỉ thật bằng tab riêng trước.

<a id="b2"></a>
### B2. Dán mã vào Blogger

1. Đăng nhập **https://www.blogger.com** bằng tài khoản Google quản lý blog.
2. Chọn **đúng blog** muốn nhúng.
3. Menu bên trái → **Bố cục (Layout)**.
4. Ở khu vực **nội dung rộng** (không phải thanh bên/Sidebar hẹp), bấm **Thêm tiện ích (Add a Gadget)**.
5. Chọn **HTML/JavaScript**, có thể đặt tiêu đề `TRA CỨU 100 HUYỆT ĐẠO`.
6. Trong ô **Nội dung (Content)**, dán **chỉ** đoạn iframe ở B1. Nhấn **Lưu (Save)**, sau đó lưu bố cục nếu Blogger yêu cầu.

**Bạn sẽ thấy:** Một khối tiện ích HTML/JavaScript trong phần Bố cục. Khi mở blog, khối tra cứu nằm ngay vị trí bạn đã đặt.

**Kết quả mong đợi:** Blog tải iframe từ GitHub Pages; không cần dán `app.js`, `data.json` hay hình ảnh vào Blogger.

**Nếu gặp lỗi:** Nếu Blogger báo “không lưu được”, hãy kiểm tra đang dán **iframe ngắn** chứ không dán HTML 4,5 MB cũ; xem **D4**. Nếu vùng đặt tiện ích quá hẹp, chuyển nó sang phần nội dung chính.

<a id="b3"></a>
### B3. Kiểm tra hiển thị trên máy tính và điện thoại

1. Mở **Xem blog (View blog)** trên máy tính, kéo đến phần tra cứu.
2. Thử gõ một từ khóa, bấm mở chi tiết, đóng cửa sổ chi tiết.
3. Bấm **Mở toàn màn hình**; website độc lập phải mở ở tab mới.
4. Mở blog trên điện thoại, thử tìm kiếm và xem ảnh; kiểm tra các nút không bị cắt, iframe không buộc phải kéo ngang.

**Bạn sẽ thấy:** Iframe rộng **100% của vùng được đặt**, cao khoảng **85% chiều cao màn hình**, tối thiểu **600 px**.

**Kết quả mong đợi:** Website dùng được cả trong Blogger lẫn khi mở trực tiếp.

**Nếu gặp lỗi:** Iframe rộng 100% nhưng vẫn hẹp là vì **vùng chứa của theme Blogger** đang hẹp; xem **D8/D9**. Khung iframe có vùng cuộn riêng khi nội dung dài, đây không phải lỗi.

---

<a id="phan-c"></a>
## PHẦN C — CẬP NHẬT NỘI DUNG SAU NÀY

<a id="c1"></a>
### C1. Sửa hoặc thêm huyệt trong `data.json`

Phiên bản hoàn chỉnh đọc **14 trường tiếng Việt** trong `data.json`:

```text
id, ten, tenHanViet, tenPinyin, nhom, duongKinh, viTri,
cachXacDinh, tacDung, chiDinh, tuKhoa, hinhAnh, thumb, trangTaiLieu
```

1. Trên máy tính, tạo **bản sao lưu** `data.json` đã chạy ổn, ví dụ `data_sao_luu_2026-11-05.json` (giữ bản sao lưu ngoài thư mục website nếu không muốn công khai trên GitHub).
2. Mở `data.json` bằng Notepad++ hoặc Visual Studio Code (miễn phí). **Giữ nguyên dấu `{ }`, dấu `[ ]`, dấu phẩy, dấu ngoặc kép `"` và mã UTF-8**.
3. Muốn **sửa vị trí** của một huyệt: tìm `"id": "huyet-019"` rồi chỉ sửa chữ ở `viTri` hoặc `cachXacDinh`; không đổi `id` hay đường dẫn ảnh nếu không thật sự cần.
4. Muốn **thêm huyệt thứ 101 trở lên**: phiên bản này mới hỗ trợ cố định 100 huyệt và ID `huyet-001`–`huyet-100`. Cần mở rộng quy tắc kiểm tra trong `app.js`, cập nhật dữ liệu dự phòng `data.local.js` và bổ sung JPG/WebP trước khi xuất bản; không tự chèn 101 vào file rồi mong website nhận.
5. **Giữ tên nhóm** chính xác một trong bảy giá trị: `Vai gáy và lưng`, `Tay`, `Ngực`, `Bụng`, `Chân - mặt sau`, `Chân - mặt trước`, `Đầu và mặt`.
6. Trường `tacDung`, `chiDinh`, `tuKhoa` là **danh sách trong ngoặc vuông**, ví dụ `"tuKhoa": ["lưng", "thận"]`. Không biến chúng thành đoạn chữ đơn lẻ. Không tự thêm tuyên bố điều trị chưa được người có chuyên môn kiểm tra.
7. Lưu tệp dưới tên **`data.json`** (không phải `data.json.txt`). Kiểm tra JSON bằng chức năng kiểm tra cú pháp của trình soạn thảo hoặc công cụ kiểm tra đã bàn giao ở Bước 1.
8. Trên GitHub, vào tab **Code → data.json → biểu tượng bút chì (Edit)**, sửa rồi **Commit changes**. Nếu đã sửa trên máy, có thể tải lại file bằng **Add file → Upload files**, xác nhận thay tệp cũ.
9. Mở link GitHub Pages, thử từ khóa liên quan đến huyệt vừa sửa. **Blogger không cần dán lại iframe**.

**Bạn sẽ thấy:** Nội dung mới sau khi GitHub xuất bản. Cần kiểm tra bản đã xuất bản thay vì chỉ nhìn tệp trong tab Code.

**Kết quả mong đợi:** Đã cập nhật đúng huyệt, không đổi nhầm ảnh hoặc làm mất dữ liệu 99 huyệt còn lại.

**Nếu gặp lỗi:** Kiểm tra JSON hợp lệ, đủ các trường và đường dẫn ảnh đúng mẫu. Khi sửa JSON để sử dụng offline, phải tạo lại `data.local.js` đồng bộ với dữ liệu mới; xem **D6/D7**.

> `trangTaiLieu` trong file 100 huyệt hiện đang đánh số **1–100 theo dữ liệu**, không phải số trang PDF thật (PDF gốc có 57 trang). Không tự ý sửa thành số trang PDF nếu chưa đối chiếu nguồn.

<a id="c2"></a>
### C2. Đổi ảnh huyệt

1. Chuẩn bị ảnh cần thay, chọn đúng huyệt (ví dụ `huyet-019` là **Thận Du**).
2. Với ảnh đầy đủ, đường dẫn đang được `data.json` chỉ tới là `images/huyet-019.jpg`. Ảnh xem trước là `images/thumb/huyet-019.webp`.
3. Nếu muốn **giữ nguyên tên**, tạo ảnh mới có cùng định dạng rồi trên GitHub Desktop **copy đè vào đúng vị trí**, Commit và Push. Nếu dùng website GitHub, mở đúng thư mục rồi tải ảnh cùng tên và xác nhận thao tác thay thế.
4. **Giữ đúng tên chuẩn `huyet-XXX.jpg` và `thumb/huyet-XXX.webp`**. Sau khi thay ảnh, tăng `VERSION` trong `sw.js` để trình duyệt bỏ cache ảnh cũ. Không tự thêm đuôi `-v2` vào tên ảnh vì phiên bản hiện tại kiểm tra tên ảnh theo ID.
5. Trước khi xuất bản, mở ảnh trực tiếp trong trình duyệt, kiểm tra dấu chấm vị trí huyệt và chú giải có đọc được trên điện thoại hay không.

**Bạn sẽ thấy:** Ảnh mới tải thành công ở đường dẫn ảnh của GitHub Pages.

**Kết quả mong đợi:** Huyệt mở đúng ảnh lớn và ảnh thu nhỏ; không trỏ nhầm một ảnh sang nhiều huyệt.

**Nếu gặp lỗi:** Ảnh không hiện thì kiểm tra **tên tệp phải đúng cả chữ hoa/chữ thường**, `.jpg` khác `.webp`, thư mục `thumb` nằm **trong** `images`. Xem **D2**.

<a id="c3"></a>
### C3. Dữ liệu cũ vẫn hiện: cách xóa cache

*Cache* là bộ nhớ tạm trên trình duyệt để trang tải nhanh hơn. `sw.js` của bản này ưu tiên tải dữ liệu/mã mới từ mạng, còn ảnh ưu tiên dùng cache. Vì vậy, **khi thay ảnh cùng tên cần tăng `VERSION` trong `sw.js`**.

1. **Trước hết**, vào GitHub → repository → tab **Code**, chắc chắn `data.json` hoặc ảnh **đã có bản mới**; kiểm tra **Settings → Pages** đã xuất bản xong.
2. Trên **máy tính Windows**, mở website GitHub Pages trực tiếp (không phải chỉ iframe), bấm **Ctrl + Shift + R** (hoặc **Ctrl + F5**) để tải lại mạnh.
3. Trên **điện thoại**, mở link GitHub Pages trong tab riêng rồi làm mới trang; nếu vẫn cũ, mở phần **Cài đặt trình duyệt → Cài đặt trang web / Dữ liệu trang web**, tìm đúng tên miền `TEN_TAI_KHOAN.github.io` và xóa dữ liệu trang đó, sau đó mở lại.
4. **Cách kỹ thuật trên Chrome/Edge** (khi vẫn lỗi): mở web GitHub Pages → nhấn **F12** → tab **Application** → **Storage** → **Clear site data**; trong **Service Workers**, có thể bấm **Unregister**, sau đó tải lại trang. Tên mục có thể khác giữa các phiên bản trình duyệt.
5. Với người quản trị website, nếu đã sửa `app.js`, `style.css`, `sw.js` hoặc thay ảnh, có thể tăng `VERSION` trong `sw.js` (ví dụ `thu-vien-huyet-v1` → `thu-vien-huyet-v2`) và xuất bản lại. Điều này tạo cache mới, thay cache cũ sau khi trình duyệt nhận bản Service Worker cập nhật.

**Bạn sẽ thấy:** Sau khi tải lại, nội dung hoặc hình mới xuất hiện.

**Kết quả mong đợi:** Hết dữ liệu cũ mà **không cần sửa iframe** ở Blogger.

**Nếu gặp lỗi:** Xóa dữ liệu trang web có thể xóa **danh sách huyệt yêu thích**, cỡ chữ đã lưu và dữ liệu của những trang khác dưới **cùng tên miền GitHub Pages**. **Chỉ dùng bước xóa dữ liệu sau khi thử tải lại thường**. Không xóa toàn bộ dữ liệu trình duyệt nếu không cần.

---

<a id="phan-d"></a>
## PHẦN D — 10 LỖI THƯỜNG GẶP VÀ CÁCH SỬA

| STT | Hiện tượng | Kiểm tra và cách xử lý |
|---|---|---|
| **D1** | **GitHub Pages báo 404** | Kiểm tra `index.html` có ngay gốc kho, đúng chữ thường; Pages chọn **Deploy from a branch → main → /(root)**; repo Public; link dùng `username.github.io/TEN_REPO/`. Đợi bản xuất bản hoàn tất, có thể đến khoảng 10 phút. |
| **D2** | **Ảnh không hiển thị / broken image** | Mở trực tiếp URL JPG/WebP trên GitHub Pages. Kiểm tra thư mục `images/`, `images/thumb/`, tên đúng `huyet-XXX` và đuôi đúng; tên tệp phân biệt chữ hoa/chữ thường. Nếu vừa thay ảnh, xem **C3**. |
| **D3** | **Website tải chậm** | Không dùng HTML base64 4,5 MB; dùng file JPG cho chi tiết, WebP nhỏ cho danh sách; ảnh danh sách tải khi cuộn (lazy loading); nén ảnh trước khi đăng. Thử trực tiếp trên GitHub Pages để so sánh với theme Blogger. |
| **D4** | **Blogger báo “không lưu được”** | Xóa mã HTML cũ nhiều MB trong tiện ích; dán **chỉ mã iframe** ở B1. Kiểm tra dấu `"` trong mã, bấm Lưu tiện ích rồi Lưu bố cục. Thử trên tiện ích HTML/JavaScript mới, không dán vào ô CSS. |
| **D5** | **Iframe trắng trơn** | Mở URL trong `src` ở tab riêng. Nếu tab riêng cũng trắng/404: sửa Pages/đường dẫn. Nếu tab riêng chạy: kiểm tra theme Blogger, trình chặn nội dung, quyền/chính sách nhúng của trang và Console trình duyệt; thử đoạn iframe tối giản. |
| **D6** | **Tìm kiếm không ra kết quả** | Bỏ nút lọc vùng, bỏ chế độ **Yêu thích**, thử `than` và tên huyệt; kiểm tra `data.json` có tải được không. **Quan trọng:** Bộ ZIP này đã đồng bộ `app.js` và `data.json`. Nếu kết quả không đúng, kiểm tra có trộn nhầm `app.js` cũ từ bộ 5 huyệt không. |
| **D7** | **Dữ liệu cũ vẫn hiện sau khi sửa** | Kiểm tra commit GitHub và Pages đã cập nhật; mở trực tiếp GitHub Pages, tải lại mạnh; xem **C3** về Service Worker và xóa dữ liệu trang. Ảnh cũ cùng tên có thể nằm trong cache ảnh. |
| **D8** | **Bố cục lỗi trên điện thoại** | Đặt iframe vào cột **nội dung chính** thay vì Sidebar; giữ `width:100%`, `height:85vh`, `min-height:600px`; kiểm tra trang độc lập cũng bị lỗi hay chỉ Blogger bị lỗi. Nếu trang độc lập lỗi, kiểm tra đúng `style.css` của bộ ZIP hoàn chỉnh. |
| **D9** | **Blogger không hiển thị/chặn iframe** | Thử tiện ích **Bố cục → HTML/JavaScript** và dùng URL `https://`. Mở URL GitHub Pages bên ngoài để xác nhận chạy. Nếu theme hoặc chính sách khung chặn nhúng, giữ liên kết **Mở toàn màn hình** để người dùng vẫn truy cập website; không cố vượt qua cơ chế bảo vệ của trình duyệt. |
| **D10** | **Link chia sẻ huyệt không mở đúng** | Đúng dạng `https://TEN_TAI_KHOAN.github.io/thu-vien-huyet/?id=...`; giá trị `id` phải tồn tại trong `data.json`. Bộ cũ dùng `GB20`, `BL23`..., bộ 100 huyệt dùng `huyet-001`...`huyet-100`. Mã hiện tại hỗ trợ `?id=huyet-XXX` và không hỗ trợ mã cũ `GB20` trong liên kết. |

**Cách tìm lỗi nhanh:** Luôn thử **website GitHub Pages độc lập trước**. Nếu trang độc lập lỗi thì sửa website; nếu chỉ Blogger lỗi thì kiểm tra iframe hoặc vị trí tiện ích.

---

<a id="phan-e"></a>
## PHẦN E — CÂU HỎI THƯỜNG GẶP (FAQ)

**1. Có phải trả tiền cho GitHub Pages hay Blogger không?**  
Không, với nhu cầu thông thường: GitHub Pages cho **repository Public** trên GitHub Free và Blogger đều có thể dùng miễn phí. Website cần tuân thủ giới hạn sử dụng và điều khoản của các dịch vụ.

**2. Có cần mua tên miền hoặc thuê hosting không?**  
Không. Dùng link miễn phí `https://TEN_TAI_KHOAN.github.io/thu-vien-huyet/` là đủ.

**3. Có cần cài Python hoặc viết lệnh để tải 200 ảnh lên GitHub không?**  
Không. Ảnh đã đúng tên từ Bước 2. Dùng GitHub Desktop để đưa 200 tệp lên dễ hơn, hoặc chia nhiều lượt tải bằng trình duyệt.

**4. Có thể tải nguyên file ZIP lên GitHub không?**  
Có thể lưu ZIP như một tệp, **nhưng GitHub Pages không tự biến ZIP thành website**. Bạn phải giải nén và tải các tệp bên trong đúng cấu trúc.

**5. Có thể mở `index.html` ngay trên Windows để xem thử không?**  
Có. Bộ ZIP này đã có `data.local.js` chứa đủ 100 huyệt. Khi mở `index.html` bằng Chrome/Edge, trang dùng dữ liệu dự phòng đó, không cần cài máy chủ.

**6. Sau khi cập nhật GitHub có cần sửa Blogger không?**  
Không, **nếu link GitHub Pages giữ nguyên**. Blogger tiếp tục nhúng cùng một iframe. Chỉ sửa iframe khi đổi username, tên repo hoặc địa chỉ website.

**7. Tại sao đã có 200 ảnh nhưng chỉ xem được 5 huyệt?**  
Nếu chỉ thấy 5 huyệt, bạn đang mở **ZIP mẫu cũ** hoặc trộn nhầm các tệp. Hãy dùng nguyên bộ `WEBSITE_HUYET_SAN_SANG_UP_GITHUB.zip` và mở lại.

**8. Có thể tìm tên huyệt không dấu không?**  
Có. Bản hoàn chỉnh đã có tìm không dấu. Ví dụ `than` tìm các huyệt liên quan đến **thận**, `lung` tìm huyệt vùng lưng và huyệt có tác dụng liên quan.

**9. Người dùng có cần tạo tài khoản để tra cứu hoặc lưu yêu thích không?**  
Không. Danh sách yêu thích được lưu trên **trình duyệt của thiết bị** (localStorage); đổi máy, dùng chế độ riêng tư, chặn lưu trữ hoặc xóa dữ liệu trang có thể làm mất danh sách đó.

**10. Website tra cứu huyệt có thay thế khám và điều trị không?**  
Không. Từ khóa, “tác dụng” và “chỉ định” được ghi lại theo tài liệu, **không chứng minh huyệt chữa được bệnh tương ứng**. Nội dung chuyên môn cần được rà soát bởi người có chuyên môn trước khi công bố; chỉ sử dụng hình ảnh khi có quyền phù hợp.

> **Thông tin chỉ mang tính tham khảo, không thay thế tư vấn y khoa. Châm cứu phải do người có chứng chỉ hành nghề thực hiện.**

---

<a id="kiem-tra-cuoi"></a>
## TỰ KIỂM TRA TRƯỚC KHI CÔNG BỐ

- [ ] Tài khoản GitHub và repository đều đã tạo xong; repository là **Public**.
- [ ] `index.html` và các tệp CSS/JS nằm **ngay thư mục gốc**.
- [ ] Đã có đủ `images/huyet-001.jpg`...`huyet-100.jpg` và `images/thumb/huyet-001.webp`...`huyet-100.webp` nếu dùng gói đầy đủ.
- [ ] Đã dùng đồng bộ `app.js`, `data.json`, `data.local.js`, `sw.js` của bộ ZIP hoàn chỉnh; không trộn ZIP cũ.
- [ ] GitHub Pages đã xuất bản và link **Visit site** hoạt động.
- [ ] Tìm không dấu, đủ 7 vùng, chi tiết, ảnh, yêu thích, chia sẻ đều được thử trên máy tính và điện thoại.
- [ ] Blogger chỉ lưu iframe ngắn, không lưu lại bản HTML base64 cũ.
- [ ] Đã kiểm tra quyền sử dụng hình ảnh và nội dung thông báo an toàn y khoa.

<a id="nguon"></a>
## NGUỒN HƯỚNG DẪN CHÍNH THỨC

- GitHub: Thêm và tải file lên kho (giới hạn 100 tệp/lượt và 25 MiB/tệp): https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- GitHub: Cấu hình nguồn xuất bản GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub: Khắc phục lỗi 404 của GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites
- GitHub Desktop: https://desktop.github.com/
- Blogger: Cách thêm tiện ích vào bố cục: https://support.google.com/blogger/answer/176245?hl=vi

*Hướng dẫn biên soạn ngày 05/11/2026. Tên nút, vị trí hiển thị và màu sắc trong GitHub/Blogger có thể thay đổi theo phiên bản giao diện. Nếu khác mô tả, hãy tìm theo **tên chức năng in đậm**.*


## Bổ sung trong phiên bản hiện tại
- Đã tích hợp logo thương hiệu tại `images/logo-huyet.png` và hiển thị ở đầu trang.
- Đã thêm `HUONG_DAN_SU_DUNG.md` dành cho người dùng cuối.
- Đã thêm `sitemap.xml` và `robots.txt` để phục vụ SEO.
- Trước khi public, hãy mở `sitemap.xml` và `robots.txt` để thay `TEN_TAI_KHOAN` bằng tài khoản GitHub thực tế của bạn.


### LƯU Ý RIÊNG: ZIP SẴN SÀNG UP GITHUB
- ZIP mới chứa các tệp ở **ngay gốc ZIP**. Khi đưa lên GitHub, **giải nén trước** và tải các tệp/thư mục lên **gốc repository** (`/(root)`); không tải nguyên ZIP, không đặt tất cả tệp trong thư mục `WEBSITE_HUYET_HOAN_CHINH`.
- Mã Blogger cuối cùng nằm trong `BLOGGER_IFRAME.txt`, dùng được trong tiện ích HTML/JavaScript ở **vùng nội dung rộng**, không phải sidebar hẹp. Nút “Mở toàn màn hình” mở website trong tab riêng.
- Giới hạn GitHub khi tải bằng trình duyệt: **tối đa 100 tệp/lượt**. Để tải hơn 200 tệp mà giữ đúng cấu trúc `images/thumb/`, khuyên dùng GitHub Desktop hoặc tải từng đợt và kiểm tra đường dẫn sau mỗi đợt.
- Trong `sitemap.xml` và `robots.txt`, URL phải là địa chỉ **đầy đủ** (đây là ngoại lệ bắt buộc của sitemap/robots, không phải đường dẫn tài nguyên). Thay `TEN_TAI_KHOAN` sau khi biết username GitHub. `robots.txt` trong thư mục dự án **không thay thế** chính sách robots gốc của tên miền `username.github.io`; có thể gửi URL `sitemap.xml` trực tiếp vào Google Search Console.
- GitHub Pages: Settings → Pages → **Deploy from a branch** → `main` → **/(root)** → Save. Chờ GitHub xuất bản; có thể lâu hơn vài phút.
