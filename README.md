### Introduction
Arona-Bot aims to simulate multiple features of Blue Archive within a discord server, including:
- Gacha simulation
- Collecting Students
- Collecting Energy, Pyroxenes and Credits
- Daily and Weekly rewards

### Data Retrieval
Using the publicly available bluearchive.wiki API and `axios` and `cheerio`, the bot retrieves all information about students, including:
- Icons
- Favor Titles
- Personal Information

As favor title are stored as segmented pieces in the API, `sharp` is used to compose the favor titles.

Currently, data retrieval is performed using:
```
node .\utility\dataScrape.js
```

### Slash Commands
