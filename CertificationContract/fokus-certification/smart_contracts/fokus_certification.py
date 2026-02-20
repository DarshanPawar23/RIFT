from beaker import *
from pyteal import *

class CertificateState:
    issued = GlobalStateValue(
        stack_type=TealType.uint64,
        default=Int(0),
        descr="Total certificates issued"
    )

app = Application("FokusCertification", state=CertificateState())


@app.external
def issue_certificate(cert_id: abi.String, cert_hash: abi.String):

    key = cert_id.get()

    return Seq(
        # Prevent duplicate certificate ID
        Assert(App.globalGet(key) == Bytes("")),

        App.globalPut(key, cert_hash.get()),

        app.state.issued.set(app.state.issued.get() + Int(1))
    )


@app.external(read_only=True)
def verify_certificate(cert_id: abi.String, *, output: abi.String):

    key = cert_id.get()

    return Seq(
        output.set(App.globalGet(key))
    )
