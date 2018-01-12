# Teacher Available Checker

PBLで制作する教員在室確認ツール。

## Updates

### Ver 0.90 (18/01/12)

- （おそらく）最終版 Final Version
  - アカウントの一連の操作、メール通知まで動作確認済み
  - 重大なバグがなければこのままレポートへ
- パスワード変更とアカウント削除の際、入力パスワードが正しくても誤りがあると通知され処理が行えない問題を修正
- ファビコンとロゴを設定
- main.phpにおいて、connectDB()を校内Raspberry Pi仕様に変更
- mail.phpにおいて、通知を行うユーザのお気に入り情報のみ取得するように変更
- 一部の日付と時刻の表記を「年月日 時分」->「// :」に変更
- index.phpにおいてアカウント設定に一部文言追加（パスワード変更時にサインアウトされる旨など）
- その他レポート用にコメント追加など

### Ver 0.22 (18/01/07)

- データベーステーブル "account" の構造を次のように変更
  - [delete]notification\_date\_begin
  - [delete]notification\_time\_begin
  - [add]notification\_begin
  - [delete]notification\_date\_end
  - [delete]notification\_time\_end
  - [add]notification\_end
- 上記の変更によるindex.phpの通知スケジュール登録処理の改修
- mail.phpを調整
- 一部のJavaScriptライブラリをCDN化
- レポート用素材を追加 （アクティビティ図、データベース図、ファイル相関図）
  - ![アクティビティ図1](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/activity-diagram1.png)
  - ![アクティビティ図2](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/activity-diagram2.png)
  - ![ファイル相関図](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/file-relationship.jpg)
  - データベース図はChanges項に記載


### Ver 0.21 (12/30)

- 一部デザイン変更
- コメントやサブルーチン化など些細な変更

### Ver 0.20 (12/24)

- メール通知設定
  - メール通知のON/OFF、期間の設定
- サイトデザインはほぼ完成
  - お気に入り選択やアカウント管理画面のMD化が完了
  - スマホビューに対応
  - ボトムタブバーはSafariで表示されない問題が発生したため廃止し標準のトップタブバーに戻した
- お気に入り教員の上限を2から4に倍増
- 一部処理のサブルーチン化
- 表の在室状況は◯/×ではなく色付きの日本語（在室/不在）に変更
- メールアドレス、ユーザー名が空欄に変更できてしまう問題を修正
- 教員名を漢字で検索できない問題を修正
- 状況表やお気に入り選択のデータを学科順に並べ替え
- サインアウト画面削除

### Ver 0.11 (12/17)

- サインアップ/サインイン画面刷新
  - Material Designに対応
- アカウント管理機能追加
  - メールアドレス/ユーザー名/パスワード変更
  - アカウント削除
- アカウント情報の厳格化
  - メールアドレスはRFC準拠
  - パスワードは8文字以上32文字以内、大文字小文字数字をすべて含めたものでないと登録不可能
- `<header>`の共通化
- トーストを導入
  - アカウント情報の変更があった場合に右上にポップアップ表示される

### Ver 0.1 (12/15)

- お気に入り機能追加
  - プルダウンメニューから教員名を選択し追加・削除が可能
  - 現時点でのお気に入り上限は2
- サインイン機能改善
  - IDは単なる番号からメールアドレスに変更
  - メールアドレスが被った場合は登録不可能
  - パスワードのハッシュ化を最新に変更

### Ver 0.0
- 赤外線センサ・CdSセルで得た在室「可能性」を校内ウェブサイトに表示
- Google Material Designの採用
- 教員一覧表示の画面でのテーブル並び替え
- 教員名の検索機能（日本語・ローマ字表記対応）

## Changes

### 通知機能について

- プッシュ通知をProgressive Web App（PWA）で実装しようとしたが、HTTPS通信必須・PWAの目玉機能であるキャッシュが不要などの点で、Javascript（Push.js）での実装に変更予定
- 当初「在室状況が変化し次第通知」としていたが、通知（クライアント側）とデータベース管理（サーバ側）で処理形態が異なるため難しいと判断し、ユーザによる通知間隔の設定に変更予定
  -	 <del>Web Pushの対応ブラウザが現時点でGoogle Chrome（ChromiumベースのVivaldiなども含む）とFirefox、Samsung Internet（独自調査）のみで、Safariなどのユーザは通知機能を使用できないため、メール通知機能も同時に実装できたらなおよい</del>
  -	 WebPushはSSL証明書が発行されたHTTPSサイトでないと使えないことが判明したため、メール通知のみにした

### OAuthログインについて

- 学校のアカウントではGoogle OAuthに必要なFirebaseに登録できなかったため、独自のサインイン機能を作成した

### タブの内容について
- <del>計画当初は「お気に入り＋登録」「最近の変更」「全教員」だったが、並び替え機能実装で最近の変更は不要になり、アカウント管理画面がないのに気づいたので、「お気に入り」「全教員」「アカウント＋お気に入り登録」としたい</del>
  - 最終的に「お気に入り（＋登録）」「全教員」「アカウント」となった

### データベース

![データベース](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/database.jpg)

- テーブルを学科で分けていたものをすべて統一（そもそも分ける意味がなかった）
- フィールド内容に学科と教員の英語名（ローマ字）を追加（検索用）
- アカウントのDBフィールドは「メールアドレス」「ユーザー名（表示用）」「パスワード」「お気に入り教員1〜4」「通知オン・オフ」「通知期間」

## Problems, Known bugs
- お気に入りを表示するテーブルで、データベースに教員を登録/削除しても反映されず、ページを再読み込みすると反映される
  - 12/17時点ではPHPによるオートリロード対応
  - 解決できないので仕様とします。
- 回路班の人材不足
- **制作時間**
  - これだけ時間をかけても、アンケートで魅力度1位を獲っても結局実用化はされないんですよ。

## Screenshots

![サインイン画面](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/tac-signin.jpg)

![サインアップ画面](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/tac-signup.jpg)

![お気に入り画面](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/tac-favorite.jpg)

![全教員画面](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/tac-all.jpg)

![アカウント管理画面](https://raw.githubusercontent.com/st14d07/Teacher-Available-Checker/master/imgs/tac-settings.jpg)
