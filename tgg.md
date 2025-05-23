# TGG

_All strings are encoded in ASCII_

_C-Strings are null terminated_

_Checksum's are in Little Endian_

## Header

| Component     | Length (In Bytes) | Type    | Description                     |
| ------------- | ----------------- | ------- | ------------------------------- |
| ID            | 14                | String  | Always: TalonGamesGame          |
| Game          | 1                 | Byte    | The type of game that is stored |
| File Checksum | 2                 | Integer | TODO                            |

### Game

| Name        | Byte |
| ----------- | ---- |
| Crossword   | 0x01 |
| Word Ladder | 0x02 |

```txt
+----------------+------+---------------+
| TalonGamesGame | Game | File Checksum |
+----------------+------+---------------+
```

## Metadata

| Component          | Length (In Bytes) | Type               |
| ------------------ | ----------------- | ------------------ |
| Title              | Variable          | C-String           |
| Description        | Variable          | C-String           |
| Author             | Variable          | C-String           |
| Creation Date      | 4                 | Integer Big Endian |
| Game Data Checksum | 2                 | Integer            |

```txt
+-------+-------------+--------+---------------+--------------------+
| Title | Description | Author | Creation Date | Game Data Checksum |
+-------+-------------+--------+---------------+--------------------+
```

## Game Data

### Crossword

| Component        | Length (In Bytes) | Type          | Description                               |
| ---------------- | ----------------- | ------------- | ----------------------------------------- |
| Width            | 1                 | Byte          | Width of crossword                        |
| Height           | 1                 | Byte          | Height of crossword                       |
| Total Clues      | 1                 | Byte          | Total number of clues                     |
| Horizontal Clues | Variable          | Clue          | List of horizontal clues                  |
| 0x00             | 1                 | Byte          | Divides horizontal and vertical clues     |
| Vertical Clues   | Variable          | Clue          | List of vertical clues                    |
| 0x00             | 1                 | Byte          | Divides vertical clues and crossword data |
| Crossword Data   | Variable          | Crossword Box | Encoded crossword                         |

```txt
+-------+--------+-------------+------------------+------+----------------+------+----------------+
| Width | Height | Total Clues | Horizontal Clues | 0x00 | Vertical Clues | 0x00 | Crossword Data |
+-------+--------+-------------+------------------+------+----------------+------+----------------+
```

#### Clue

| Component | Length (In Bytes) | Type     | Description                       |
| --------- | ----------------- | -------- | --------------------------------- |
| Number    | 1                 | Byte     | The word the clue coresponds with |
| Clue      | Variale           | C-String | Actual clue                       |

```txt
+--------+------+
| Number | Clue |
+--------+------+
```

#### Crossword Box

| Component | Length (In Bytes) | Type   | Description                                                                                                |
| --------- | ----------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Number    | 1                 | Byte   | The clue the word coresponds with, only included if the box has the first letter of a word, otherwise 0x00 |
| Letter    | 1                 | String | Uppercase ASCII Letter # (0x23) for solid, " " (0x20)                                                      |

```txt
+--------+--------+
| Number | Letter |
+--------+--------+

```

#### Example Crossword

```txt
C A T
# # A
# # B
```

Crosswords are encoded left to right from top to bottom.

```
+------+------+------+
| 0x03 | 0x03 | 0x02 |
+------+------+------+
Horizontal Clues
+------------------------------------------+
| 0x01 0x01 0x47 6F 6F 64 20 50 65 74 0x00 |
+------------------------------------------+
+------+
| 0x00 |
+------+
Vetical Clues
+------------------------------------------------------------------------+
| 0x02 0x02 0x53 74 61 72 74 73 20 61 20 70 61 72 61 67 72 61 70 68 0x00 |
+------------------------------------------------------------------------+
+------+
| 0x00 |
+------+
Crossword
+-----------+-----------+-----------+-----------+-----------+-----------+-----------+-----------+-----------+
| 0x01 0x43 | 0x00 0x41 | 0x02 0x54 | 0x00 0x23 | 0x00 0x23 | 0x00 0x41 | 0x00 0x23 | 0x00 0x23 | 0x00 0x42 |
+-----------+-----------+-----------+-----------+-----------+-----------+-----------+-----------+-----------+
```

### Word Ladder

| Component         | Length (In Bytes) | Type     | Description                                   |
| ----------------- | ----------------- | -------- | --------------------------------------------- |
| Starting Word     | Variable          | C-String | The word at the top of the ladder             |
| Starting Word Def | Variable          | C-String | The deffinition or hint for the word          |
| Ending Word       | Variable          | C-String | The word at the bottom of the ladder          |
| Ending Word Def   | Variable          | C-String | The deffinition or hint for the word          |
| Step Count        | 1                 | Byte     | The amount of words between the start and end |
| Step              | Variable          | Step     | Step Count amount of steps                    |

#### Step

| Component | Length (In Bytes) | Type     | Description           |
| --------- | ----------------- | -------- | --------------------- |
| Word      | Variable          | C-String | The word in the step  |
| Hint      | Variable          | C-String | The hint for the step |
| 0x00      | 1                 | Byte     | Divides steps         |

```
+------+------+------+
| Word | Hint | 0x00 |
+------+------+------+
```

## Footer

| Component     | Length (In Bytes) | Type    |
| ------------- | ----------------- | ------- |
| File Checksum | 2                 | Integer |

```txt
+---------------+
| File Checksum |
+---------------+
```
