
# Book Reader (book-reader)

> ...

## Running your project

```bash
$ node server.dev.js
```

# Notes

```xml
<DocumentTitle title="Select A Book">
	<BookList />
</DocumentTitle>

<!-- Language Selection-->
<DocumentTitle title={book.title + " - Select A Language"}>
	<LanguageSelection book="josephine" />
</DocumentTitle>

<!-- Book -->
<Book name="josephine" language="en" page="1">
	<DocumentTitle title={book.title}>
		<Screen />
		<!-- OR -->
		<BookPage>
			<canvas>
				<BookLine>
					<BookWord/>
				</BookLine>
			</canvas>
		</BookPage>
	</DocumentTitle>
</DocumentTitle>
```

```
* App just has <Page>
* <Page> has its normal stuff, plus <BookPage> (which includes hammer js)
* <BookPage> Also has on swipe and on tap
* App.transitionPage => Checks to make sure its a valid target
* Migrate more code out of Screen class so we don't have play audio on game pages
* Make ogg default
* Fix clicking on hotspot when window is scrolled
```
