
# Book Reader (book-reader)

> ...

## Running your project

The generated project includes a live-reloading static server on port `8080` (you can change the port in the `gulpfile.js` config), which will build, launch, and rebuild the app whenever you change application code. To start the server, run:

```bash
$ npm start
```

If you prefer to just build without the live reload and build-on-each-change watcher, run:

```bash
$ npm run build
```


## Generating Additional Code

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
*   If page > pageCount, then goto 'end'
```
https://github.com/goldfire/howler.js/blob/1dad25cdd9d6982232050454e8b45411902efe65/howler.js
