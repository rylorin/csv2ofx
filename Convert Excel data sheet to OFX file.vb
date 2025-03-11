Rem Convert Excel data sheet to OFX file format

Rem the following functions have to be updated to match data sheet columns
Function getAccountNo(i As Long) As String
    getAccountNo = Range("Data").Offset(i, 7).Value
End Function
Function getDate(i As Long) As Date
    getDate = Range("Data").Offset(i, 0).Value
End Function
Function getPayee(i As Long) As String
    getPayee = Range("Data").Offset(i, 1).Value
End Function
Function getCategory(i As Long) As String
    getCategory = Range("Data").Offset(i, 2).Value
End Function
Function getAmount(i As Long) As Double
    getAmount = Range("Data").Offset(i, 3).Value
End Function
Function getFee(i As Long) As Double
    getFee = 0
End Function
Function getMemo(i As Long) As String
    getMemo = Range("Data").Offset(i, 4).Value
End Function
Function getLabel(i As Long) As String
    getLabel = Range("Data").Offset(i, 6).Value
End Function
Function getTranId(i As Long) As String
    getTranId = Range("Data").Offset(i, 7).Value
End Function

Function myReplace(s As String) As String
Rem we should use HTML entities but this is not supported by GnuCash
'    s = Replace(s, "é", "&eacute;")
'    s = Replace(s, "è", "&egrave;")
'    s = Replace(s, "ê", "&ecirc;")
'    s = Replace(s, "à", "&agrave;")
'    s = Replace(s, "ù", "&ugrave;")
'    s = Replace(s, "É", "&Eacute;")
'    s = Replace(s, "&", "&amp;")
    s = Replace(s, "é", "√©")
    s = Replace(s, "è", "√®")
    s = Replace(s, "ê", "√™")
    s = Replace(s, "à", "√†")
    s = Replace(s, "ù", "√π")
    s = Replace(s, "É", "√â")
    s = Replace(s, "ô", "√¥")
    s = Replace(s, "ë", "√´")
    s = Replace(s, "ï", "√Ø")
    s = Replace(s, "ç", "√ß")
    s = Replace(s, "&", "et")
    myReplace = s
End Function

Sub cbGenerateOFX_Click()
' Generate OFX file from the data in the 'Export to OFX' spreadsheet

' On Error Resume Next

    ' General variables
Dim BankId As String
Dim AccountNo As String
Dim AccountBis As String
Dim AcctType As String
Dim AcctCurrency As String
Dim PreviousBalance As Double
Dim FinalBalance As Double
Dim StatementStartDate As Date
Dim StatementEndDate As Date
dim fromDate as Date

    ' Row variables
Dim iTransaction As Long    ' Current row number
Dim sTranName As String
Dim sTranCategory As String
Dim sTranMemo As String
Dim sTranLabels As String
dim sTranAccount as String
dim sTranDate as Date
dim sTranAmount as Double
dim sTranFTID as String
Dim sTranAmountStr as String
Dim sTranFee as Double

' Output file name
Dim OutputFilename As String

' OFX file header
Dim OFX_HEADER As String
Dim OFX_SIGNONMSGSRSV1_HEADER As String
Dim OFX_SIGNONMSGSRSV1_DTSERVER As String
Dim OFX_SIGNONMSGSRSV1_FOOTER As String
Dim OFX_BANKMSGSRSV1_HEADER As String
Dim OFX_BANKMSGSRSV1_FOOTER As String

' Bank account information
Dim OFX_BANKACCTFROM_HEADER As String
Dim OFX_BANKID As String
Dim OFX_ACCTID As String
Dim OFX_ACCTTYPE As String
Dim OFX_BANKACCTFROM_FOOTER As String

' Transaction list information
Dim OFX_BANKTRANLIST_HEADER As String
Dim OFX_BANKTRANLIST_DTSTART As String
Dim OFX_BANKTRANLIST_DTEND As String
Dim OFX_BANKTRANLIST_FOOTER As String

' Transactions information
Dim OFX_STMTTRN_HEADER As String
Dim OFX_STMTTRN_TRNTYPE As String
Dim OFX_STMTTRN_DTPOSTED As String
Dim OFX_STMTTRN_TRNAMT As String
Dim OFX_STMTTRN_FITID As String
Dim OFX_STMTTRN_NAME As String
Dim OFX_STMTTRN_MEMO As String
Dim OFX_STMTTRN_FOOTER As String

' Ledger balance information
Dim OFX_LEDGERBAL_HEADER As String
Dim OFX_LEDGERBAL_BALAMT As String
Dim OFX_LEDGERBAL_DTASOF As String
Dim OFX_LEDGERBAL_FOOTER As String

' Closing tag
Dim OFX_FOOTER As String

' OFX file header
OFX_HEADER = "<?xml version=""1.0"" encoding=""utf-8"" ?>" & vbNewLine & _
    "<?OFX OFXHEADER=""200"" VERSION=""202"" SECURITY=""NONE"" OLDFILEUID=""NONE"" NEWFILEUID=""NONE""?>" & vbNewLine & _
    "<OFX>"

OFX_SIGNONMSGSRSV1_HEADER = Chr(9) & "<SIGNONMSGSRSV1>" & vbNewLine & _
                            Chr(9) & Chr(9) & "<SONRS>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & "<STATUS>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<CODE>0</CODE>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<SEVERITY>INFO</SEVERITY>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & "</STATUS>"
OFX_SIGNONMSGSRSV1_DTSERVER = Chr(9) & Chr(9) & Chr(9) & "<DTSERVER>"
OFX_SIGNONMSGSRSV1_DTSERVER_CLOSE = "</DTSERVER>"
OFX_SIGNONMSGSRSV1_FOOTER = Chr(9) & Chr(9) & Chr(9) & "<LANGUAGE>ENG</LANGUAGE>" & vbNewLine & _
                            Chr(9) & Chr(9) & "</SONRS>" & vbNewLine & _
                            Chr(9) & "</SIGNONMSGSRSV1>"

OFX_BANKMSGSRSV1_HEADER = Chr(9) & "<BANKMSGSRSV1>" & vbNewLine & _
                            Chr(9) & Chr(9) & "<STMTTRNRS>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & "<TRNUID>0</TRNUID>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & "<STATUS>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<CODE>0</CODE>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<SEVERITY>INFO</SEVERITY>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & "</STATUS>" & vbNewLine & _
                            Chr(9) & Chr(9) & Chr(9) & "<STMTRS>"
                            
OFX_CURDEF_OPEN = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<CURDEF>"
OFX_CURDEF_CLOSE = "</CURDEF>"
OFX_STMTRS_FOOTER = Chr(9) & Chr(9) & Chr(9) & "</STMTRS>"
OFX_STMTTRNRS_FOOTER = Chr(9) & Chr(9) & "</STMTTRNRS>"
OFX_BANKMSGSRSV1_FOOTER = Chr(9) & "</BANKMSGSRSV1>"

' Bank account information
OFX_BANKACCTFROM_HEADER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<BANKACCTFROM>"
OFX_BANKID = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<BANKID>"
OFX_BANKID_CLOSE = "</BANKID>"
OFX_ACCTID = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<ACCTID>"
OFX_ACCTID_CLOSE = "</ACCTID>"
OFX_ACCTTYPE = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<ACCTTYPE>"
OFX_ACCTTYPE_CLOSE = "</ACCTTYPE>"
OFX_BANKACCTFROM_FOOTER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "</BANKACCTFROM>"

' Transaction list information
OFX_BANKTRANLIST_HEADER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<BANKTRANLIST>"
OFX_BANKTRANLIST_DTSTART = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<DTSTART>"
OFX_BANKTRANLIST_DTSTART_CLOSE = "</DTSTART>"
OFX_BANKTRANLIST_DTEND = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<DTEND>"
OFX_BANKTRANLIST_DTEND_CLOSE = "</DTEND>"
OFX_BANKTRANLIST_FOOTER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "</BANKTRANLIST>"

' Transactions information
OFX_STMTTRN_HEADER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<STMTTRN>"
OFX_STMTTRN_TRNTYPE = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<TRNTYPE>"
OFX_STMTTRN_TRNTYPE_CLOSE = "</TRNTYPE>"
OFX_STMTTRN_DTPOSTED = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<DTPOSTED>"
OFX_STMTTRN_DTPOSTED_CLOSE = "</DTPOSTED>"
OFX_STMTTRN_TRNAMT = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<TRNAMT>"
OFX_STMTTRN_TRNAMT_CLOSE = "</TRNAMT>"
OFX_STMTTRN_FITID = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<FITID>"
OFX_STMTTRN_FITID_CLOSE = "</FITID>"
OFX_STMTTRN_NAME = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<NAME>"
OFX_STMTTRN_NAME_CLOSE = "</NAME>"
OFX_STMTTRN_MEMO = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<MEMO>"
OFX_STMTTRN_MEMO_CLOSE = "</MEMO>"
OFX_STMTTRN_FOOTER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "</STMTTRN>"

' Ledger balance information
OFX_LEDGERBAL_HEADER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<LEDGERBAL>"
OFX_LEDGERBAL_BALAMT = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<BALAMT>"
OFX_LEDGERBAL_BALAMT_CLOSE = "</BALAMT>"
OFX_LEDGERBAL_DTASOF = Chr(9) & Chr(9) & Chr(9) & Chr(9) & Chr(9) & "<DTASOF>"
OFX_LEDGERBAL_DTASOF_CLOSE = "</DTASOF>"
OFX_LEDGERBAL_FOOTER = Chr(9) & Chr(9) & Chr(9) & Chr(9) & "</LEDGERBAL>"

' Closing tag
OFX_FOOTER = "</OFX>"

Range("Statut") = "Running..."
' Open output file
If Left(Range("OutputFile"), 1) = Application.PathSeparator Then
    OutputFilename = Range("OutputFile")
Else
    OutputFilename = Application.ThisWorkbook.Path & Application.PathSeparator & Range("OutputFile")
End If
Open OutputFilename For Output As #1
If Err.Number < 0 Then
    iReturn = MsgBox(Error(Err.Number), vbCritical, "XLS2OFX Runtime Error" & Error(Err.Number) & (Err.Number))
Else
    BankId = Range("BankId").Value
    AccountNo = Range("AccountNo").Value
    AccountBis = Range("AccountNo").Value
    AcctType = Range("AcctType").Value
    AcctCurrency = Range("AcctCurrency").Value
    StatementStartDate = Range("StatementStartDate").Value
    StatementEndDate = Range("StatementEndDate").Value
    fromDate = Range("FromDate").Value

    ' Write OFX Header
    Print #1, (OFX_HEADER)
    Print #1, (OFX_SIGNONMSGSRSV1_HEADER)
    Print #1, OFX_SIGNONMSGSRSV1_DTSERVER & Format(StatementEndDate, "yyyymmdd") & OFX_SIGNONMSGSRSV1_DTSERVER_CLOSE
    Print #1, (OFX_SIGNONMSGSRSV1_FOOTER)
    
    Print #1, (OFX_BANKMSGSRSV1_HEADER)
    Print #1, OFX_CURDEF_OPEN & AcctCurrency & OFX_CURDEF_CLOSE
    
    Print #1, (OFX_BANKACCTFROM_HEADER)
    Print #1, OFX_BANKID & myReplace(BankId) & OFX_BANKID_CLOSE
    Print #1, OFX_ACCTID & myReplace(AccountBis) & OFX_ACCTID_CLOSE
    Print #1, OFX_ACCTTYPE & AcctType & OFX_ACCTTYPE_CLOSE
    Print #1, (OFX_BANKACCTFROM_FOOTER)
    
    ' Write financial transactions
    Print #1, (OFX_BANKTRANLIST_HEADER)
    Print #1, OFX_BANKTRANLIST_DTSTART & Format(StatementStartDate, "yyyymmdd") & "000000.000" & OFX_BANKTRANLIST_DTSTART_CLOSE
    Print #1, OFX_BANKTRANLIST_DTEND & Format(StatementEndDate, "yyyymmdd") & "235959.999" & OFX_BANKTRANLIST_DTEND_CLOSE
    
    PreviousBalance = Range("PreviousBalance")
    FinalBalance = PreviousBalance
    iTransaction = 1
    
    While (Range("Data").Offset(iTransaction, 0).Value <> "") And (iTransaction <= Range("MaxLines").Value)
        Range("Statut") = "Running... " & iTransaction
        ' Get transaction information
        sTranDate = getDate(iTransaction)
        sTranName = getPayee(iTransaction)
        sTranCategory = getCategory(iTransaction)
        sTranAmount = getAmount(iTransaction)
        sTranFee = getFee(iTransaction)
        sTranMemo = getMemo(iTransaction)
        sTranLabels = getLabel(iTransaction)
        sTranAccount = getAccountNo(iTransaction)
        sTranFTID = getTranId(iTransaction)
        if sTranAccount = "" then
            sTranAccount = AccountNo
        end if
        if sTranFTID = "" then
            sTranFTID = Format(sTranDate, "yyyymmddhhmmss") & ":" & Format(iTransaction, "00000")
        end if
        sTranAmountStr = Replace(Format(sTranAmount, "0.00"), ",", ".")

        ' Check if transaction is for this account
        If (sTranAccount = AccountNo) And (sTranAmountStr <> "0.00") and ((FromDate = 0) or (sTranDate >= FromDate)) Then
            ' Record transaction in OFX format
            Print #1, (OFX_STMTTRN_HEADER)
            If sTranAmount < 0 Then
                Print #1, OFX_STMTTRN_TRNTYPE & "DEBIT" & OFX_STMTTRN_TRNTYPE_CLOSE
            Else
                Print #1, OFX_STMTTRN_TRNTYPE & "CREDIT" & OFX_STMTTRN_TRNTYPE_CLOSE
            End If
            Print #1, OFX_STMTTRN_DTPOSTED & Format(sTranDate, "yyyymmddhhmmss") & OFX_STMTTRN_DTPOSTED_CLOSE
            Print #1, OFX_STMTTRN_TRNAMT & sTranAmountStr & OFX_STMTTRN_TRNAMT_CLOSE
            Print #1, OFX_STMTTRN_FITID & sTranFTID & OFX_STMTTRN_FITID_CLOSE
            Print #1, OFX_STMTTRN_NAME & myReplace(sTranName) & OFX_STMTTRN_NAME_CLOSE
            ofxMemo = myReplace(sTranCategory)
            If Len(sTranLabels) Then
                If Len(ofxMemo) Then
                    ofxMemo = ofxMemo & " / "
                End If
                ofxMemo = ofxMemo & myReplace(sTranLabels)
            End If
            If Len(sTranMemo) Then
                If Len(ofxMemo) Then
                    ofxMemo = ofxMemo & " / "
                End If
                ofxMemo = ofxMemo & myReplace(sTranMemo)
            End If
            If Len(ofxMemo) > 0 Then
                Print #1, OFX_STMTTRN_MEMO & (ofxMemo) & OFX_STMTTRN_MEMO_CLOSE
            End If
            Print #1, (OFX_STMTTRN_FOOTER)

            ' Transaction fee if any
            If sTranFee <> 0 Then
                Print #1, (OFX_STMTTRN_HEADER)
                ' Transaction type could be FEE?
                If sTranFee > 0 Then
                    Print #1, OFX_STMTTRN_TRNTYPE & "DEBIT" & OFX_STMTTRN_TRNTYPE_CLOSE
                Else
                    Print #1, OFX_STMTTRN_TRNTYPE & "CREDIT" & OFX_STMTTRN_TRNTYPE_CLOSE
                End If
                Print #1, OFX_STMTTRN_DTPOSTED & Format(sTranDate, "yyyymmddhhmmss") & OFX_STMTTRN_DTPOSTED_CLOSE
                Print #1, OFX_STMTTRN_TRNAMT & -sTranFee & OFX_STMTTRN_TRNAMT_CLOSE
                Print #1, OFX_STMTTRN_FITID & sTranFTID & "F" & OFX_STMTTRN_FITID_CLOSE
                Print #1, OFX_STMTTRN_NAME & "Fee" & OFX_STMTTRN_NAME_CLOSE
                Print #1, (OFX_STMTTRN_FOOTER)
            End If

            FinalBalance = FinalBalance + sTranAmount
        End If

        ' Get next transaction
        iTransaction = iTransaction + 1
    Wend
    Range("FinalBalance") = FinalBalance
    
    Print #1, (OFX_BANKTRANLIST_FOOTER)
    ' Ledger balance
    Print #1, (OFX_LEDGERBAL_HEADER)
    Print #1, OFX_LEDGERBAL_BALAMT & Format(FinalBalance, "0.00") & OFX_LEDGERBAL_BALAMT_CLOSE
    Print #1, OFX_LEDGERBAL_DTASOF & Format(StatementEndDate, "yyyymmdd") & OFX_LEDGERBAL_DTASOF_CLOSE
    Print #1, (OFX_LEDGERBAL_FOOTER)
    
    ' Write OFX Footer
    Print #1, (OFX_STMTRS_FOOTER)
    Print #1, OFX_STMTTRNRS_FOOTER
    Print #1, OFX_BANKMSGSRSV1_FOOTER
    Print #1, (OFX_FOOTER)
    
    ' Close file
    Close #1
End If
Range("Statut") = "Done"

End Sub
